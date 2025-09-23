import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth-v2';
import { updateEventHoleScore, getEventByCode } from '@/lib/db-prisma';
import { pusherServer } from '@/lib/pusher';

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
    
    const { holeNumber, strokes, hotDogs, beers, beerType } = await request.json();
    
    if (!holeNumber || holeNumber < 1 || holeNumber > 9) {
      return NextResponse.json(
        { error: 'Invalid hole number' },
        { status: 400 }
      );
    }
    
    const event = await getEventByCode(eventCode);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }
    
    await updateEventHoleScore(
      user.userId,
      event.id,
      holeNumber,
      strokes,
      hotDogs || 0,
      beers || 0,
      beerType
    );
    
    await pusherServer.trigger(
      `competition-${event.id}`,
      'score-update',
      {
        username: user.displayName || user.phoneNumber,
        holeNumber,
        strokes,
        hotDogs,
        beers,
        beerType
      }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json(
      { error: 'Failed to update score' },
      { status: 500 }
    );
  }
}