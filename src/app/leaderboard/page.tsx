'use client';

import Leaderboard from '@/components/Leaderboard';
import Link from 'next/link';

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">9/9/9 Challenge</h1>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Join Challenge
            </Link>
            <Link
              href="/play"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              My Scorecard
            </Link>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <Leaderboard />
      </div>
    </div>
  );
}