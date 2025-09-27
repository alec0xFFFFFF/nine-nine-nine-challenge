'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventScorecard from '@/components/EventScorecard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AugustaBackground from '@/components/ui/AugustaBackground';

export default function EventPlayPage() {
  const params = useParams();
  const eventCode = params.eventCode as string;
  const [user, setUser] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const router = useRouter();

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
      } else {
        router.push(`/event/${eventCode}`);
      }
    } catch {
      router.push(`/event/${eventCode}`);
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
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out successfully');
    router.push(`/event/${eventCode}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin  h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative">
      <AugustaBackground variant="field" opacity={5} />
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-600">
              {event?.name || '9/9/9 Challenge'}
            </h1>
            <p className="text-sm text-gray-800">Event Code: {eventCode}</p>
          </div>
          <div className="flex gap-4">
            <Link
              href={`/event/${eventCode}`}
              className="px-4 py-2 bg-primary text-primary-foreground  hover:bg-primary/90 transition-colors"
            >
              View Leaderboard
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white  hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <EventScorecard eventCode={eventCode} />
      </div>
    </div>
  );
}