import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getParticipantScores, getOrCreateCompetition } from '@/lib/db';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const competition = await getOrCreateCompetition();
    const scores = await getParticipantScores(user.id, competition.id);
    
    return NextResponse.json({ scores });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch scores' },
      { status: 500 }
    );
  }
}