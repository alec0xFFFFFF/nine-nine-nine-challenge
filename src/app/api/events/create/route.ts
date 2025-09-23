import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-v2';
import { createEvent } from '@/lib/db-prisma';

export async function POST(request: Request) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const { name, eventDate, description, location } = await request.json();
    
    if (!name || !eventDate) {
      return NextResponse.json(
        { error: 'Name and date are required' },
        { status: 400 }
      );
    }
    
    const event = await createEvent(
      user.userId,
      name,
      eventDate,
      description,
      location
    );
    
    return NextResponse.json({ 
      success: true,
      event,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/event/${event.event_code}`
    });
  } catch (error: any) {
    console.error('Event creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}