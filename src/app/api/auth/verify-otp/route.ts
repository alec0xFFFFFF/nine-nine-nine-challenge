import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { stytchConfig } from '@/lib/stytch';
import { createOrUpdateUser } from '@/lib/db-prisma';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { phoneNumber, code, displayName } = await request.json();
    
    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and code are required' },
        { status: 400 }
      );
    }
    
    // Format phone number to E.164
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const e164Phone = formattedPhone.startsWith('1') 
      ? `+${formattedPhone}` 
      : `+1${formattedPhone}`;
    
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