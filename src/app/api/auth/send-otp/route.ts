import { NextResponse } from 'next/server';
import { stytchConfig } from '@/lib/stytch';

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();
    
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Format phone number to E.164
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const e164Phone = formattedPhone.startsWith('1') 
      ? `+${formattedPhone}` 
      : `+1${formattedPhone}`;
    
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