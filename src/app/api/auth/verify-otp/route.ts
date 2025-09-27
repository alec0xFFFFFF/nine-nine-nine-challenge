import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { stytchConfig } from '@/lib/stytch';
import { createOrUpdateUser } from '@/lib/db-prisma';
import jwt from 'jsonwebtoken';
import { validateAndFormatUSPhone, rateLimiter } from '@/lib/phone-validation';
import { sessionStore } from '@/lib/session-store';

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
    
    // Use the correct Stytch API endpoint for the environment
    const apiUrl = stytchConfig.env === 'live'
      ? 'https://api.stytch.com'
      : 'https://test.stytch.com';

    // Retrieve the phone_id from the session store
    const otpSession = sessionStore.retrieve(e164Phone);
    if (!otpSession) {
      return NextResponse.json(
        { error: 'OTP session expired. Please request a new code.' },
        { status: 400 }
      );
    }

    console.log('Verifying OTP for:', e164Phone);
    console.log('Using phone_id:', otpSession.phoneId);

    const response = await fetch(
      `${apiUrl}/v1/otps/authenticate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(
            `${stytchConfig.projectId}:${stytchConfig.secret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          method_id: otpSession.phoneId, // Use the correct phone_id from send response
          code: code,
          session_duration_minutes: 43200 // 30 days
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Stytch verify error:', {
        status: response.status,
        error: data.error_message,
        error_type: data.error_type,
        error_url: data.error_url
      });

      // Handle specific authentication errors
      if (data.error_type === 'otp_not_found' || data.error_type === 'invalid_code') {
        return NextResponse.json(
          { error: 'Invalid or expired verification code. Please try again.' },
          { status: 400 }
        );
      }

      if (data.error_type === 'invalid_method_id') {
        return NextResponse.json(
          { error: 'OTP session expired. Please request a new code.' },
          { status: 400 }
        );
      }

      if (data.error_type === 'rate_limit_exceeded') {
        return NextResponse.json(
          { error: 'Too many verification attempts. Please wait before trying again.' },
          { status: 429 }
        );
      }

      throw new Error(data.error_message || 'Invalid code');
    }
    
    // Log successful verification
    console.log('OTP verified successfully for:', e164Phone);
    console.log('Stytch user_id:', data.user_id);
    console.log('Session created:', !!data.session_token);

    // Clean up the session after successful verification
    sessionStore.remove(e164Phone);

    // Create or update user in our database using Stytch user data
    const stytchUser = data.user || { user_id: data.user_id };
    const user = await createOrUpdateUser(
      e164Phone,
      stytchUser.user_id,
      displayName
    );
    
    // Create JWT token with Stytch session info
    const token = jwt.sign(
      {
        userId: user.id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        stytchUserId: stytchUser.user_id,
        stytchSessionToken: data.session_token, // Store Stytch session for future use
        methodId: data.method_id
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