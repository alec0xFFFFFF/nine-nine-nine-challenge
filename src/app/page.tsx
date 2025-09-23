'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [eventCode, setEventCode] = useState('');
  const router = useRouter();

  const handleJoinEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      router.push(`/event/${eventCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-blue-500 to-yellow-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-4">9/9/9</h1>
          <p className="text-xl text-gray-700 mb-2">The Ultimate Golf Challenge</p>
          <div className="flex justify-center items-center gap-4 text-3xl">
            <span>⛳</span>
            <span>🌭</span>
            <span>🍺</span>
          </div>
          <p className="text-gray-600 mt-4">
            9 Holes • 9 Hot Dogs • 9 Beers
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/dashboard"
            className="block w-full bg-green-600 text-white p-4 rounded-lg font-bold text-lg hover:bg-green-700 transition-colors"
          >
            🎯 Create New Event
          </Link>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form onSubmit={handleJoinEvent} className="space-y-3">
            <input
              type="text"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              className="w-full p-3 border-2 border-gray-300 rounded-lg text-center font-mono text-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="ENTER EVENT CODE"
              maxLength={8}
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              🏌️ Join Event
            </button>
          </form>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold mb-3">How It Works</h3>
          <div className="text-sm text-gray-600 space-y-2 text-left">
            <div className="flex items-start gap-2">
              <span className="text-green-600 font-bold">1.</span>
              <span>Play 9 holes of golf</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-orange-600 font-bold">2.</span>
              <span>Consume 9 hot dogs during the round</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 font-bold">3.</span>
              <span>Drink 9 beers throughout the game</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>Track everything live & get kudos!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
