'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import MastersHeader from '@/components/ui/MastersHeader';
import AugustaBackground from '@/components/ui/AugustaBackground';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      
      const joinRes = await fetch('/api/competition/join', { method: 'POST' });
      
      router.push('/play');
    } catch (error: any) {
      toast.error(error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative flex items-center justify-center p-4">
      <AugustaBackground variant="field" opacity={5} />
      <div className="bg-white shadow-lg p-8 w-full max-w-md">
        <div className="mb-8">
          <MastersHeader
            title="9/9/9 Challenge"
            subtitle="9 Holes ⛳ 9 Hot Dogs 🌭 9 Beers 🍺"
            variant="light"
            size="md"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">
            {isLogin ? 'Login' : 'Register'}
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border  focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minLength={3}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border  focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white p-3  font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login & Join' : 'Register & Join')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline"
              disabled={loading}
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}