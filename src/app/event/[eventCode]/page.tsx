'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PhoneAuth from '@/components/PhoneAuth';
import EventLeaderboard from '@/components/EventLeaderboard';
import MediaUpload from '@/components/MediaUpload';
import EventJoinCode from '@/components/EventJoinCode';

interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;
  event_date: string;
  join_code: string;
  creator_user_id: number;
}

export default function EventPage() {
  const params = useParams();
  const eventCode = params.eventCode as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchEventData();
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
      const res = await fetch(`/api/events/${eventCode}/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
      }
    } catch (error) {
      console.error('Failed to fetch event data:', error);
    }
    setLoading(false);
  };

  const handleJoinEvent = () => {
    setShowAuth(true);
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
              <h1 className="text-2xl font-bold text-blue-700">{event.name}</h1>
              <div className="text-sm text-gray-800">
                {event.location && <span>{event.location} • </span>}
                {new Date(event.event_date).toLocaleDateString()}
              </div>
              {event.description && (
                <p className="text-gray-900 mt-1">{event.description}</p>
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
        {/* Join Code for Event Creator */}
        {user && event && user.id === event.creator_user_id && (
          <EventJoinCode 
            joinCode={event.join_code} 
            eventCode={eventCode}
          />
        )}

        {/* Leaderboard */}
        <EventLeaderboard eventCode={eventCode} />

        {/* Media Upload for Authenticated Users */}
        {user && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📸 Share the Action</h2>
            <MediaUpload
              eventCode={eventCode}
              onUploadComplete={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}