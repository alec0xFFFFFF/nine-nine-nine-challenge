'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Container from '@/components/ui/Container';
import MastersHeader from '@/components/ui/MastersHeader';
import TournamentStats from '@/components/ui/TournamentStats';
import AugustaBackground from '@/components/ui/AugustaBackground';

export default function Home() {
  const [eventCode, setEventCode] = useState('');
  const router = useRouter();

  const handleJoinEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (eventCode.trim()) {
      router.push(`/event/${eventCode.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative flex items-center justify-center p-4">
      <AugustaBackground variant="field" opacity={5} />

      <div className="relative z-10 w-full max-w-6xl">
        <Container size="md">
          <MastersHeader
            title="9/9/9 Challenge"
            subtitle='"The Ultimate Golf Championship Experience"'
            variant="dark"
            size="lg"
            className="mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Main Tournament Card */}
            <Card variant="elevated" className="border-2 border-primary/20">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-primary">Tournament Entry</CardTitle>
                <p className="text-muted-foreground font-serif italic">Join the Championship</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <TournamentStats variant="default" />

                <div className="space-y-4">
                  <Button asChild size="lg" className="w-full font-serif">
                    <Link href="/dashboard">
                      ⛳ HOST NEW TOURNAMENT
                    </Link>
                  </Button>

                  <div className="flex items-center">
                    <div className="flex-grow border-t border-border"></div>
                    <span className="flex-shrink mx-4 text-muted-foreground font-serif italic text-sm">or</span>
                    <div className="flex-grow border-t border-border"></div>
                  </div>

                  <form onSubmit={handleJoinEvent} className="space-y-4">
                    <Input
                      type="text"
                      value={eventCode}
                      onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                      className="text-center font-mono text-lg border-2 border-primary/30 focus:border-primary"
                      style={{
                        fontFamily: 'Monaco, monospace',
                        letterSpacing: '0.2em'
                      }}
                      placeholder="TOURNAMENT CODE"
                      maxLength={8}
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="lg"
                      className="w-full font-serif"
                    >
                      🏌️ JOIN TOURNAMENT
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>

            {/* Tournament Rules Card */}
            <Card variant="elevated" className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-primary text-center">Championship Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-secondary/30 p-4  border-l-4 border-primary">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-bold font-serif min-w-[20px]">I.</span>
                        <span className="font-serif">Complete nine (9) holes of championship golf</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold font-serif min-w-[20px]">II.</span>
                        <span className="font-serif">Consume nine (9) hot dogs during competition</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-amber-600 font-bold font-serif min-w-[20px]">III.</span>
                        <span className="font-serif">Imbibe nine (9) beverages throughout the round</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-primary font-bold font-serif min-w-[20px]">IV.</span>
                        <span className="font-serif">Record performance with live scoring & honors</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-xs text-muted-foreground font-serif italic">
                      "A tradition unlike any other"
                    </p>
                  </div>

                  <div className="bg-primary/5 p-4  text-center">
                    <h4 className="font-serif font-semibold text-primary mb-2">Tournament Features</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs font-serif text-muted-foreground">
                      <div>• Live Leaderboard</div>
                      <div>• Photo Sharing</div>
                      <div>• Real-time Scoring</div>
                      <div>• Achievement System</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </div>
  );
}
