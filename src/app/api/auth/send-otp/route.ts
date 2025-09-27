import { NextResponse } from 'next/server';
import { stytchConfig } from '@/lib/stytch';
import { validateAndFormatUSPhone, rateLimiter } from '@/lib/phone-validation';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Check if Stytch is configured
    if (!stytchConfig.projectId || !stytchConfig.secret) {
      console.error('Stytch not configured properly. Please set STYTCH_PROJECT_ID and STYTCH_SECRET in .env.local');
      return NextResponse.json(
        { error: 'SMS service not configured. Please contact support.' },
        { status: 503 }
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

    // Rate limiting by IP and phone number
    const rateLimitKey = `${clientIp}-${e164Phone}`;
    if (!rateLimiter.canAttempt(rateLimitKey)) {
      const remainingMinutes = rateLimiter.getRemainingTime(rateLimitKey);
      return NextResponse.json(
        { error: `Too many attempts. Please try again in ${remainingMinutes} minutes.` },
        { status: 429 }
      );
    }

    console.log('Sending OTP to US number:', e164Phone);
    console.log('Client IP:', clientIp);

    const response = await fetch(
      `https://test.stytch.com/v1/otps/sms/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(
            `${stytchConfig.projectId}:${stytchConfig.secret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify({
          phone_number: e164Phone,
        }),
      }
    );
    
    const data = await response.json();

    if (!response.ok) {
      console.error('Stytch API error:', {
        status: response.status,
        error: data.error_message,
        error_type: data.error_type,
        error_url: data.error_url
      });
      throw new Error(data.error_message || 'Failed to send OTP');
    }
    
    return NextResponse.json({ 
      success: true,
      phone_id: data.phone_id,
      masked_phone: e164Phone.slice(-4)
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}