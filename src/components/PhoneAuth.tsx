'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { validateAndFormatUSPhone } from '@/lib/phone-validation';
import TournamentStats from '@/components/ui/TournamentStats';
import MastersHeader from '@/components/ui/MastersHeader';
import AugustaBackground from '@/components/ui/AugustaBackground';

interface PhoneAuthProps {
  redirectTo?: string;
  eventCode?: string;
}

export default function PhoneAuth({ redirectTo = '/dashboard', eventCode }: PhoneAuthProps) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const router = useRouter();

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Limit to 10 digits (US phone numbers without country code)
    const limited = cleaned.slice(0, 10);

    // Format as (XXX) XXX-XXXX
    if (limited.length >= 6) {
      const areaCode = limited.slice(0, 3);
      const middle = limited.slice(3, 6);
      const last = limited.slice(6, 10);
      return `(${areaCode}) ${middle}${last ? '-' + last : ''}`;
    } else if (limited.length >= 3) {
      const areaCode = limited.slice(0, 3);
      const middle = limited.slice(3);
      return `(${areaCode}) ${middle}`;
    } else if (limited.length > 0) {
      return `(${limited}`;
    }
    return '';
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number client-side first
    const validation = validateAndFormatUSPhone(phoneNumber);
    if (!validation.isValid) {
      toast.error(validation.error!);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Verification code sent!');
      setStep('code');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send code');
    }
    
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber,
          code,
          displayName: displayName || undefined
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      toast.success('Successfully authenticated!');
      
      // If coming from event page, join the event
      if (eventCode) {
        await fetch(`/api/events/${eventCode}/join`, { method: 'POST' });
      }
      
      router.push(redirectTo);
    } catch (error: any) {
      toast.error(error.message || 'Invalid code');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/90 to-primary relative flex items-center justify-center p-4">
      <AugustaBackground variant="field" opacity={5} />

      <div className="border-4 border-primary shadow-lg p-8 w-full max-w-md relative z-10" style={{
        background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        <div className="text-center mb-8">
          {/* Masters-inspired header */}
          <div className="border-b-2 border-primary pb-4 mb-6">
            <MastersHeader
              title="9/9/9 Challenge"
              subtitle="Authentication"
              variant="light"
              size="md"
            />
            <div className="mt-4">
              <TournamentStats variant="compact" />
            </div>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendCode} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary text-center mb-6 tracking-wide">Player Registration</h2>
            
            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Mobile Telephone</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-mono text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Monaco, monospace'
                }}
                placeholder="(555) 123-4567"
                required
                disabled={loading}
              />
              <p className="text-xs text-primary font-serif mt-2">
                United States mobile numbers only • Standard messaging rates apply
              </p>
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Player Name (Optional)</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="Tiger Woods"
                disabled={loading}
              />
              <p className="text-xs text-primary font-serif mt-2">
                Name displayed on tournament leaderboard
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 font-bold hover:from-primary/90 hover:to-primary disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 transform hover:scale-105 border-2 border-primary shadow-sm"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {loading ? 'SENDING VERIFICATION...' : 'SEND VERIFICATION CODE'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-primary text-center mb-6 tracking-wide">Verification Code</h2>
            <div className="bg-secondary border-l-4 border-primary p-3 text-center">
              <p className="text-primary font-serif text-sm">
                Authentication code sent to {phoneNumber}
              </p>
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Authentication Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full p-4 border-3 border-primary text-center font-mono text-3xl focus:ring-4 focus:ring-primary/30 focus:outline-none tracking-widest"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Monaco, monospace'
                }}
                placeholder="000000"
                maxLength={6}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 font-bold hover:from-primary/90 hover:to-primary disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 transform hover:scale-105 border-2 border-primary shadow-sm"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              {loading ? 'AUTHENTICATING...' : 'VERIFY & CONTINUE'}
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-primary hover:text-primary font-serif text-sm mt-4 py-2 hover:bg-secondary transition-colors"
              disabled={loading}
            >
              Use different phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}