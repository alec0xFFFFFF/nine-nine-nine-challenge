'use client';

import { useState, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';

interface LeaderboardEntry {
  username: string;
  total_score: number;
  total_strokes: number;
  total_hot_dogs: number;
  total_beers: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competition, setCompetition] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    const interval = setInterval(fetchLeaderboard, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!competition) return;
    
    const channel = pusherClient.subscribe(`competition-${competition.id}`);
    
    channel.bind('score-update', (data: any) => {
      setLastUpdate(data);
      fetchLeaderboard();
    });

    return () => {
      pusherClient.unsubscribe(`competition-${competition.id}`);
    };
  }, [competition]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setCompetition(data.competition);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getPlaceEmoji = (place: number) => {
    switch (place) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white  shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Live Leaderboard</h2>
          {competition && (
            <span className="text-sm text-gray-700">{competition.name}</span>
          )}
        </div>

        {lastUpdate && (
          <div className="bg-blue-50 border border-blue-200  p-3 mb-4 animate-pulse">
            <span className="text-sm">
              <strong>{lastUpdate.username}</strong> just updated Hole {lastUpdate.holeNumber}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`border  p-4 transition-all ${
                index === 0 ? 'border-yellow-400 bg-yellow-50' :
                index === 1 ? 'border-gray-400 bg-gray-50' :
                index === 2 ? 'border-orange-400 bg-orange-50' :
                'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gray-800">
                    {getPlaceEmoji(index + 1) || `#${index + 1}`}
                  </span>
                  <div>
                    <h3 className="font-semibold text-lg">{entry.username}</h3>
                    <span className="text-sm text-gray-700">
                      Score: {entry.total_score} (Lower is better)
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-800">⛳ {entry.total_strokes || 0} strokes</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🌭 Hot Dogs</span>
                    <span className="font-semibold">{entry.total_hot_dogs || 0}/9</span>
                  </div>
                  <div className="w-full bg-gray-200  h-2">
                    <div
                      className="bg-orange-500 h-2  transition-all"
                      style={{ width: `${calculateProgress(entry.total_hot_dogs || 0, 9)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🍺 Beers</span>
                    <span className="font-semibold">{entry.total_beers || 0}/9</span>
                  </div>
                  <div className="w-full bg-gray-200  h-2">
                    <div
                      className="bg-yellow-500 h-2  transition-all"
                      style={{ width: `${calculateProgress(entry.total_beers || 0, 9)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-700">
            No participants yet. Be the first to join!
          </div>
        )}
      </div>
    </div>
  );
}