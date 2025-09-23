import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { getOrCreateCompetition, joinCompetition } from '@/lib/db';

export async function POST() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const competition = await getOrCreateCompetition();
    const joined = await joinCompetition(user.id, competition.id);
    
    if (!joined) {
      return NextResponse.json(
        { message: 'Already joined this competition', competition },
        { status: 200 }
      );
    }
    
    return NextResponse.json({ competition, joined: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join competition' },
      { status: 500 }
    );
  }
}