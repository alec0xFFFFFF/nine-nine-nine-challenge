'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateEvent from '@/components/CreateEvent';
import PhoneAuth from '@/components/PhoneAuth';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is authenticated by trying to create an event endpoint
      const res = await fetch('/api/auth/verify-otp', {
        method: 'GET'
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      // Not authenticated
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <PhoneAuth redirectTo="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 via-green-800 to-green-900 relative">
      {/* Augusta National inspired background */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Masters-inspired header */}
      <nav className="relative z-10 border-b-4 border-green-800 shadow-2xl" style={{
        background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)'
      }}>
        <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-green-900 mb-1" style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontFamily: 'Georgia, serif'
            }}>9/9/9 Challenge</h1>
            <p className="text-sm text-green-700 font-serif italic tracking-wide">"Tournament Director Dashboard"</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-green-700 font-serif">Welcome,</p>
              <span className="text-green-900 font-serif font-semibold text-lg">
                {user.displayName || user.phoneNumber}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gradient-to-r from-red-700 to-red-800 text-cream-50 font-serif font-semibold hover:from-red-800 hover:to-red-900 transition-all duration-300 border-2 border-red-800 shadow-lg"
              style={{
                fontFamily: 'Georgia, serif'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 py-8">
        <CreateEvent />
      </div>
    </div>
  );
}