import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-v2';
import { joinEvent, getEventByCode } from '@/lib/db-v2';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventCode: string }> }
) {
  const { eventCode } = await params;
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const event = await getEventByCode(eventCode);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    const joined = await joinEvent(user.userId, eventCode);
    
    return NextResponse.json({ 
      success: true,
      joined,
      event
    });
  } catch (error: any) {
    console.error('Join event error:', error);
    return NextResponse.json(
      { error: 'Failed to join event' },
      { status: 500 }
    );
  }
}