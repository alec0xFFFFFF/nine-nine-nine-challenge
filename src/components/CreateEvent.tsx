'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import TournamentStats from '@/components/ui/TournamentStats';

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          eventDate,
          location,
          description,
          challengeType: selectedChallenge?.name || '9/9/9 Golf Challenge'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      setShareUrl(data.shareUrl);
      toast.success('Event created successfully!');
      
      // Copy share URL to clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      toast.success('Share link copied to clipboard!');
      
      // Redirect to event page
      setTimeout(() => {
        router.push(`/event/${data.event.event_code}`);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="border-4 border-primary shadow-lg p-8" style={{
        background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        {/* Masters-inspired header */}
        <div className="text-center mb-8">
          <div className="border-b-2 border-primary pb-4 mb-6">
            <h2 className="text-3xl font-serif font-bold text-primary mb-2" style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontFamily: 'Georgia, serif'
            }}>Create Tournament</h2>
            <p className="text-sm text-primary font-semibold tracking-widest uppercase">9/9/9 Challenge</p>
          </div>

          <div className="flex justify-center mb-4">
            <TournamentStats
              variant="compact"
              interactive={true}
              onChallengeChange={(challenge) => {
                setSelectedChallenge(challenge);
                setName(challenge.name);
              }}
            />
          </div>
        </div>
        
        {!shareUrl ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Tournament Name*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="The Masters 9/9/9 Championship"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Tournament Date*</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Golf Course</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="Augusta National Golf Club"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-primary mb-2 tracking-wide">Tournament Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border-3 border-primary focus:ring-4 focus:ring-primary/30 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="An exclusive 9/9/9 championship. A tradition unlike any other."
                rows={4}
                disabled={loading}
              />
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
              {loading ? 'CREATING TOURNAMENT...' : 'CREATE TOURNAMENT & GET LINK'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="bg-secondary border-l-4 border-primary p-6">
              <h3 className="font-serif font-bold text-primary mb-3 text-xl">Tournament Created Successfully!</h3>
              <p className="text-sm font-serif text-primary mb-4">Share this exclusive invitation with participants:</p>
              <div className="border-3 border-primary p-4 break-all font-mono text-sm" style={{
                background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)'
              }}>
                {shareUrl}
              </div>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="w-full bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 font-bold hover:from-primary/90 hover:to-primary transition-all duration-300 transform hover:scale-105 border-2 border-primary shadow-sm"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              COPY INVITATION LINK
            </button>

            <p className="text-sm text-primary font-serif italic">Redirecting to tournament leaderboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}