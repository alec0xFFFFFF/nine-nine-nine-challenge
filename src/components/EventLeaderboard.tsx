'use client';

import { useState, useEffect } from 'react';
import { pusherClient } from '@/lib/pusher';
import KudosButton from './KudosButton';

interface LeaderboardEntry {
  participant_id: number;
  display_name?: string;
  phone_number: string;
  total_score: number;
  total_strokes: number;
  total_hot_dogs: number;
  total_beers: number;
  total_kudos: number;
}

interface EventLeaderboardProps {
  eventCode: string;
  showKudos?: boolean;
}

export default function EventLeaderboard({ eventCode, showKudos = true }: EventLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<any>(null);

  useEffect(() => {
    fetchLeaderboard();
    
    const interval = setInterval(fetchLeaderboard, 30000);
    
    return () => clearInterval(interval);
  }, [eventCode]);

  useEffect(() => {
    if (!event) return;
    
    const channel = pusherClient.subscribe(`competition-${event.id}`);
    
    channel.bind('score-update', (data: any) => {
      setLastUpdate(data);
      fetchLeaderboard();
    });

    return () => {
      pusherClient.unsubscribe(`competition-${event.id}`);
    };
  }, [event]);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`/api/events/${eventCode}/leaderboard`);
      const data = await res.json();
      if (data.leaderboard) {
        setLeaderboard(data.leaderboard);
        setEvent(data.event);
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

  const getDisplayName = (participant: LeaderboardEntry) => {
    return participant.display_name || 
           participant.phone_number.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '($2) $3-****');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Live Leaderboard</h2>
          {event && (
            <span className="text-sm text-gray-500">{event.name}</span>
          )}
        </div>

        {lastUpdate && (
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 animate-pulse">
            <span className="text-sm">
              <strong>{lastUpdate.username}</strong> just updated Hole {lastUpdate.holeNumber}
            </span>
          </div>
        )}

        <div className="space-y-4">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.participant_id}
              className={`border rounded-lg p-4 transition-all ${
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
                    <h3 className="font-semibold text-lg text-gray-900">{getDisplayName(entry)}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-800">
                      <span>Score: {entry.total_score}</span>
                      <span>⛳ {entry.total_strokes || 0}</span>
                      <span>👏 {entry.total_kudos} kudos</span>
                    </div>
                  </div>
                </div>
                
                {showKudos && (
                  <KudosButton
                    eventCode={eventCode}
                    participantId={entry.participant_id}
                    participantName={getDisplayName(entry)}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🌭 Hot Dogs</span>
                    <span className="font-semibold">{entry.total_hot_dogs || 0}/9</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculateProgress(entry.total_hot_dogs || 0, 9)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>🍺 Beers</span>
                    <span className="font-semibold">{entry.total_beers || 0}/9</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all"
                      style={{ width: `${calculateProgress(entry.total_beers || 0, 9)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {leaderboard.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No participants yet. Be the first to join!
          </div>
        )}
      </div>
    </div>
  );
}