'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

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
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary flex items-center justify-center p-4 relative">
      {/* Augusta National inspired background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <Card variant="elevated" className="border-4 border-primary shadow-2xl w-full max-w-md text-center relative z-10 bg-card">
        <CardContent className="p-8">
          <div className="mb-8">
            {/* Masters-inspired header */}
            <div className="border-b-2 border-primary pb-4 mb-6">
              <h1 className="text-5xl font-serif font-bold text-primary mb-2" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                fontFamily: 'Georgia, serif'
              }}>9/9/9</h1>
              <p className="text-sm text-primary/80 font-semibold tracking-widest uppercase">Challenge</p>
            </div>

            <p className="text-lg text-card-foreground mb-4 font-serif italic">"The Ultimate Golf Challenge"</p>

            {/* Classic scorecard style icons */}
            <div className="flex justify-center items-center gap-6 text-2xl mb-4">
              <div className="text-center">
                <span className="block text-primary">⛳</span>
                <span className="text-xs text-muted-foreground font-serif">HOLES</span>
              </div>
              <div className="text-center">
                <span className="block text-orange-600">🌭</span>
                <span className="text-xs text-muted-foreground font-serif">DOGS</span>
              </div>
              <div className="text-center">
                <span className="block text-amber-600">🍺</span>
                <span className="text-xs text-muted-foreground font-serif">BEERS</span>
              </div>
            </div>

            <div className="bg-primary/10 border-l-4 border-primary p-3 text-sm">
              <p className="text-card-foreground font-serif">
                <span className="font-bold">IX</span> Holes • <span className="font-bold">IX</span> Hot Dogs • <span className="font-bold">IX</span> Beers
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <Button asChild size="lg" className="w-full font-serif text-lg shadow-lg">
              <Link href="/dashboard">
                ⛳ HOST NEW TOURNAMENT
              </Link>
            </Button>

            <div className="flex items-center my-6">
              <div className="flex-grow border-t-2 border-primary/30"></div>
              <span className="flex-shrink mx-4 text-muted-foreground font-serif italic text-sm">or</span>
              <div className="flex-grow border-t-2 border-primary/30"></div>
            </div>

            <form onSubmit={handleJoinEvent} className="space-y-4">
              <Input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                className="text-center font-mono text-lg border-2 border-primary"
                style={{
                  fontFamily: 'Monaco, monospace',
                  letterSpacing: '0.2em'
                }}
                placeholder="TOURNAMENT CODE"
                maxLength={8}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full font-serif shadow-lg"
              >
                🏌️ JOIN TOURNAMENT
              </Button>
            </form>
          </div>

          <div className="mt-8 pt-6 border-t-2 border-primary">
            <h3 className="font-serif font-bold text-card-foreground mb-4 tracking-wide">TOURNAMENT RULES</h3>
            <div className="text-sm text-muted-foreground space-y-3 text-left bg-primary/5 p-4 border-l-4 border-primary">
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

            <p className="text-xs text-muted-foreground font-serif italic text-center mt-4">
              "A tradition unlike any other"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
