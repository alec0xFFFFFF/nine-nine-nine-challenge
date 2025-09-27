import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { stytchConfig } from '@/lib/stytch';
import { createOrUpdateUser } from '@/lib/db-prisma';
import jwt from 'jsonwebtoken';
import { validateAndFormatUSPhone, rateLimiter } from '@/lib/phone-validation';

// GET handler for checking auth status
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token.value,
      process.env.JWT_SECRET || 'your-secret-key'
    ) as any;

    return NextResponse.json({
      user: {
        id: decoded.userId,
        phoneNumber: decoded.phoneNumber,
        displayName: decoded.displayName
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { phoneNumber, code, displayName } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      );
    }

    // Get client IP for rate limiting
    const headersList = await headers();
    const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] ||
                     headersList.get('x-real-ip') ||
                     'unknown';

    // Validate and format phone number (US only, with toll fraud protection)
    const validation = validateAndFormatUSPhone(phoneNumber);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const e164Phone = validation.e164Number!;

    // Rate limiting for verification attempts
    const rateLimitKey = `verify-${clientIp}-${e164Phone}`;
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingMinutes = rateLimiter.getRemainingTime(rateLimitKey);
      return NextResponse.json(
        { error: `Too many verification attempts. Please try again in ${remainingMinutes} minutes.` },
        { status: 429 }
      );
    }
    
    const response = await fetch(
      `https://test.stytch.com/v1/otps/authenticate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(
            `${stytchConfig.projectId}:${stytchConfig.secret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          method_id: e164Phone,
          code,
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error_message || 'Invalid code');
    }
    
    // Create or update user in our database
    const user = await createOrUpdateUser(
      e164Phone,
      data.user_id,
      displayName
    );
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        stytchUserId: data.user_id
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );
    
    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
    
    return NextResponse.json({ 
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName
      }
    });
  } catch (error: any) {
    console.error('OTP verify error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}