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
    <div className="max-w-5xl mx-auto px-6">
      <div className="bg-white border border-gray-300 shadow-sm">
        {/* Classic header */}
        <div className="border-b-2 border-green-700 bg-green-50 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-green-800">LEADERBOARD</h2>
            {event && (
              <span className="text-sm font-medium text-green-700 uppercase tracking-wide">{event.name}</span>
            )}
          </div>
        </div>

        {lastUpdate && (
          <div className="bg-green-50 border-l-4 border-green-700 px-6 py-3">
            <span className="text-sm font-medium text-green-800">
              <strong>{lastUpdate.username}</strong> just updated Hole {lastUpdate.holeNumber}
            </span>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="divide-y divide-gray-200">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.participant_id}
              className={`px-6 py-4 transition-all hover:bg-gray-50 ${
                index === 0 ? 'bg-green-50 border-l-4 border-green-700' :
                index === 1 ? 'bg-gray-50 border-l-4 border-gray-400' :
                index === 2 ? 'bg-yellow-50 border-l-4 border-yellow-600' :
                'border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Position */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 border-2 border-gray-300">
                    <span className="text-xl font-bold text-gray-900">
                      {index + 1}
                    </span>
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">{getDisplayName(entry)}</h3>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-800">
                      <span className="bg-gray-100 px-2 py-1 rounded">TOTAL: {entry.total_score}</span>
                      <span>⛳ {entry.total_strokes || 0} strokes</span>
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

              {/* Progress indicators */}
              <div className="mt-4 grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌭</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-medium text-gray-800 mb-1">
                      <span>HOT DOGS</span>
                      <span>{entry.total_hot_dogs || 0}/9</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full">
                      <div
                        className="bg-orange-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${calculateProgress(entry.total_hot_dogs || 0, 9)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-2xl">🍺</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-medium text-gray-800 mb-1">
                      <span>BEERS</span>
                      <span>{entry.total_beers || 0}/9</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full">
                      <div
                        className="bg-yellow-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${calculateProgress(entry.total_beers || 0, 9)}%` }}
                      />
                    </div>
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