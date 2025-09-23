import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { updateHoleScore, getOrCreateCompetition } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
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
    
    const competition = await getOrCreateCompetition();
    
    await updateHoleScore(
      user.id,
      competition.id,
      holeNumber,
      strokes,
      hotDogs || 0,
      beers || 0,
      beerType
    );
    
    await pusherServer.trigger(
      `competition-${competition.id}`,
      'score-update',
      {
        username: user.username,
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