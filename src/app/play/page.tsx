'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Scorecard from '@/components/Scorecard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AugustaBackground from '@/components/ui/AugustaBackground';

export default function PlayPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/scores/my-scores');
      if (res.ok) {
        setUser(true);
      } else {
        router.push('/');
      }
    } catch {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast.success('Logged out successfully');
    router.push('/');
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
          <h1 className="text-2xl font-bold text-blue-600">9/9/9 Challenge</h1>
          <div className="flex gap-4">
            <Link
              href="/leaderboard"
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
        <Scorecard />
      </div>
    </div>
  );
}