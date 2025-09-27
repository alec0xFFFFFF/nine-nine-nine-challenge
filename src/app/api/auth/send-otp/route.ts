import { NextResponse } from 'next/server';
import { stytchConfig } from '@/lib/stytch';
import { validateAndFormatUSPhone, rateLimiter } from '@/lib/phone-validation';
import { sessionStore } from '@/lib/session-store';
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
    console.log('Stytch Project ID:', stytchConfig.projectId ? 'configured' : 'missing');
    console.log('Stytch Environment:', stytchConfig.env);

    // Use the correct Stytch API endpoint for the environment
    const apiUrl = stytchConfig.env === 'live'
      ? 'https://api.stytch.com'
      : 'https://test.stytch.com';

    // Use the login_or_create endpoint to handle both new and existing users
    const response = await fetch(
      `${apiUrl}/v1/otps/sms/login_or_create`,
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
          expiration_minutes: 10
        }),
      }
    );
    
    const data = await response.json();

    if (!response.ok) {
      console.error('Stytch API error:', {
        status: response.status,
        error: data.error_message,
        error_type: data.error_type,
        error_url: data.error_url,
        projectId: stytchConfig.projectId ? 'set' : 'missing',
        env: stytchConfig.env
      });

      // Handle specific Stytch error types
      if (data.error_type === 'unauthorized' || data.error_type === 'project_not_found' || !stytchConfig.projectId) {
        return NextResponse.json(
          { error: 'SMS service not configured. Please set up Stytch credentials in .env.local' },
          { status: 503 }
        );
      }

      // Handle phone number validation errors
      if (data.error_type === 'invalid_phone_number' || data.error_type === 'invalid_phone_number_country_code') {
        return NextResponse.json(
          { error: 'Invalid phone number format. Please enter a valid US mobile number.' },
          { status: 400 }
        );
      }

      // Handle rate limiting
      if (data.error_type === 'rate_limit_exceeded') {
        return NextResponse.json(
          { error: 'Too many SMS requests. Please try again later.' },
          { status: 429 }
        );
      }

      throw new Error(data.error_message || 'Failed to send OTP');
    }
    
    // Store the phone_id and user info for later verification
    sessionStore.store(e164Phone, data.phone_id, data.user_id);

    return NextResponse.json({
      success: true,
      phone_id: data.phone_id,
      user_id: data.user_id,
      user_created: data.user_created, // Indicates if this is a new user
      masked_phone: validation.formattedNumber
    });
  } catch (error: any) {
    console.error('OTP send error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send OTP' },
      { status: 500 }
    );
  }
}