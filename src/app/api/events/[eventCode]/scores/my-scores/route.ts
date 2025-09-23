import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-v2';
import { getParticipantScores, getEventByCode } from '@/lib/db-prisma';

export async function GET(
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
    
    const scores = await getParticipantScores(user.userId, event.id);
    
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}