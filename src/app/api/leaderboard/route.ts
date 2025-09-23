import { NextResponse } from 'next/server';
import { getLeaderboard, getOrCreateCompetition } from '@/lib/db';

export async function GET() {
  try {
    const competition = await getOrCreateCompetition();
    const leaderboard = await getLeaderboard(competition.id);
    
    return NextResponse.json({ 
      competition,
      leaderboard 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}