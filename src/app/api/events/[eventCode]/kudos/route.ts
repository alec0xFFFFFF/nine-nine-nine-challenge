import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { giveKudos, getEventByCode, getEventTopKudos } from '@/lib/db-v2';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventCode: string }> }
) {
  const { eventCode } = await params;
  try {
    const event = await getEventByCode(eventCode);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const { participantId, kudosType } = await request.json();
    
    if (!participantId || !kudosType) {
      return NextResponse.json(
        { error: 'Participant and kudos type are required' },
        { status: 400 }
      );
    }
    
    // Get or create session ID for anonymous kudos
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('session-id')?.value;
    
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      cookieStore.set('session-id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }
    
    const success = await giveKudos(
      event.id,
      participantId,
      kudosType,
      sessionId
    );
    
    return NextResponse.json({ 
      success,
      alreadyGiven: !success
    });
  } catch (error: any) {
    console.error('Kudos error:', error);
    return NextResponse.json(
      { error: 'Failed to give kudos' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventCode: string }> }
) {
  const { eventCode } = await params;
  try {
    const event = await getEventByCode(eventCode);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const topKudos = await getEventTopKudos(event.id);
    
    return NextResponse.json({ topKudos });
  } catch (error: any) {
    console.error('Get kudos error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kudos' },
      { status: 500 }
    );
  }
}