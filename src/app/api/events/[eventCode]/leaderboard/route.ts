import { NextResponse } from 'next/server';
import { getEventByCode, getEventLeaderboard } from '@/lib/db-v2';

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
    
    const leaderboard = await getEventLeaderboard(event.id);
    
    return NextResponse.json({ 
      event,
      leaderboard 
    });
  } catch (error: any) {
    console.error('Leaderboard fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}