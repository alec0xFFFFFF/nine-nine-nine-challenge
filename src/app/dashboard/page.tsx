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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-yellow-50">
      <nav className="bg-white shadow-md p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">9/9/9 Challenge</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Welcome, {user.displayName || user.phoneNumber}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <CreateEvent />
      </div>
    </div>
  );
}