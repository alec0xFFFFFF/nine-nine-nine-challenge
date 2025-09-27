'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateEvent from '@/components/CreateEvent';
import PhoneAuth from '@/components/PhoneAuth';
import Button from '@/components/ui/Button';
import Container from '@/components/ui/Container';
import MastersHeader from '@/components/ui/MastersHeader';
import TournamentStats from '@/components/ui/TournamentStats';
import AugustaBackground from '@/components/ui/AugustaBackground';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin  h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <PhoneAuth redirectTo="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative">
      <AugustaBackground variant="field" opacity={5} />

      {/* Masters-inspired header */}
      <nav className="relative z-10 bg-card border-b-4 border-primary shadow-sm">
        <Container>
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-6">
              <MastersHeader
                title="9/9/9 Challenge"
                subtitle='"Tournament Director Dashboard"'
                variant="light"
                size="sm"
                className="text-left"
              />
              <TournamentStats variant="compact" className="hidden md:grid" />
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground font-serif">Welcome,</p>
                <span className="text-card-foreground font-serif font-semibold text-lg">
                  {user.displayName || user.phoneNumber}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="font-serif"
              >
                Logout
              </Button>
            </div>
          </div>
        </Container>
      </nav>

      <div className="relative z-10 py-8">
        <CreateEvent />
      </div>
    </div>
  );
}