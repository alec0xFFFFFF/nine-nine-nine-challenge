'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PhoneAuth from '@/components/PhoneAuth';
import EventLeaderboard from '@/components/EventLeaderboard';
import MediaUpload from '@/components/MediaUpload';
import EventJoinCode from '@/components/EventJoinCode';
import AugustaBackground from '@/components/ui/AugustaBackground';

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
        <div className="animate-spin  h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Event Not Found</h1>
          <p className="text-gray-800">The event code "{eventCode}" is invalid or expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative">
      <AugustaBackground variant="field" opacity={5} />
      {/* Classic header with Augusta green */}
      <div className="bg-white border-b-4 border-primary shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-serif font-bold text-primary mb-2">{event.name}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-900 font-medium">
                {event.location && (
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-primary "></span>
                    <span>{event.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-primary "></span>
                  <span>{new Date(event.event_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>
              {event.description && (
                <p className="text-gray-800 mt-3 text-base leading-relaxed">{event.description}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-3">
              {!user ? (
                <button
                  onClick={handleJoinEvent}
                  className="px-8 py-3 bg-primary text-primary-foreground font-semibold border-2 border-primary hover:bg-primary/90 hover:border-primary/90 transition-all duration-200 shadow-sm"
                >
                  JOIN CHALLENGE
                </button>
              ) : (
                <a
                  href={`/event/${eventCode}/play`}
                  className="px-8 py-3 bg-white text-primary font-semibold border-2 border-primary hover:bg-secondary transition-all duration-200 shadow-sm text-center"
                >
                  MY SCORECARD
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
          <div className="bg-white shadow-md p-6">
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