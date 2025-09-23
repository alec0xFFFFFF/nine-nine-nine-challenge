'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PhoneAuth from '@/components/PhoneAuth';
import KudosButton from '@/components/KudosButton';
import MediaUpload from '@/components/MediaUpload';
import { KUDOS_TYPES } from '@/lib/db-v2';

interface Participant {
  participant_id: number;
  display_name?: string;
  phone_number: string;
  total_score: number;
  total_strokes: number;
  total_hot_dogs: number;
  total_beers: number;
  total_kudos: number;
}

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  event_date: string;
}

export default function EventPage() {
  const params = useParams();
  const eventCode = params.eventCode as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [leaderboard, setLeaderboard] = useState<Participant[]>([]);
  const [topKudos, setTopKudos] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchEventData();
    const interval = setInterval(fetchEventData, 30000);
    return () => clearInterval(interval);
  }, [eventCode]);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'GET'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      // User not authenticated, that's okay for spectators
    }
  };

  const fetchEventData = async () => {
    try {
      const [leaderboardRes, kudosRes] = await Promise.all([
        fetch(`/api/events/${eventCode}/leaderboard`),
        fetch(`/api/events/${eventCode}/kudos`)
      ]);

      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json();
        setEvent(data.event);
        setLeaderboard(data.leaderboard);
      }

      if (kudosRes.ok) {
        const kudosData = await kudosRes.json();
        setTopKudos(kudosData.topKudos);
      }
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    }
    setLoading(false);
  };

  const handleJoinEvent = () => {
    setShowAuth(true);
  };

  const getPlaceEmoji = (place: number) => {
    switch (place) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getDisplayName = (participant: Participant) => {
    return participant.display_name || 
           participant.phone_number.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '($2) $3-****');
  };

  if (showAuth) {
    return <PhoneAuth redirectTo={`/event/${eventCode}/play`} eventCode={eventCode} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Event Not Found</h1>
          <p className="text-gray-600">The event code "{eventCode}" is invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <div className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">{event.name}</h1>
              <div className="text-sm text-gray-600">
                {event.location && <span>{event.location} • </span>}
                {new Date(event.event_date).toLocaleDateString()}
              </div>
              {event.description && (
                <p className="text-gray-700 mt-1">{event.description}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              {!user ? (
                <button
                  onClick={handleJoinEvent}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  🏌️ Join Challenge
                </button>
              ) : (
                <a
                  href={`/event/${eventCode}/play`}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  📊 My Scorecard
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🏆 Live Leaderboard</h2>
          
          <div className="space-y-4">
            {leaderboard.map((participant, index) => (
              <div
                key={participant.participant_id}
                className={`border rounded-lg p-4 transition-all ${
                  index === 0 ? 'border-yellow-400 bg-yellow-50' :
                  index === 1 ? 'border-gray-400 bg-gray-50' :
                  index === 2 ? 'border-orange-400 bg-orange-50' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-600">
                      {getPlaceEmoji(index + 1) || `#${index + 1}`}
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">{getDisplayName(participant)}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Score: {participant.total_score}</span>
                        <span>⛳ {participant.total_strokes || 0}</span>
                        <span>👏 {participant.total_kudos} kudos</span>
                      </div>
                    </div>
                  </div>
                  
                  <KudosButton
                    eventCode={eventCode}
                    participantId={participant.participant_id}
                    participantName={getDisplayName(participant)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>🌭 Hot Dogs</span>
                      <span className="font-semibold">{participant.total_hot_dogs || 0}/9</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((participant.total_hot_dogs || 0) / 9 * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>🍺 Beers</span>
                      <span className="font-semibold">{participant.total_beers || 0}/9</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((participant.total_beers || 0) / 9 * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No participants yet. Be the first to join the challenge!
            </div>
          )}
        </div>

        {/* Top Kudos */}
        {topKudos.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🌟 Top Kudos</h2>
            <div className="grid gap-3">
              {topKudos.map((kudos, index) => {
                const kudosInfo = KUDOS_TYPES[kudos.kudos_type as keyof typeof KUDOS_TYPES];
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{kudosInfo?.emoji}</span>
                      <div>
                        <div className="font-semibold">{getDisplayName(kudos)}</div>
                        <div className="text-sm text-gray-600">{kudosInfo?.name}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-yellow-600">
                      {kudos.kudos_count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Media Upload for Authenticated Users */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📸 Share the Action</h2>
            <MediaUpload
              eventCode={eventCode}
              onUploadComplete={fetchEventData}
            />
          </div>
        )}
      </div>
    </div>
  );
}