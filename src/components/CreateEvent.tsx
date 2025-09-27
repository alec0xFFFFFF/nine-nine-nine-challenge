'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function CreateEvent() {
  const [name, setName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
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
          description
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
      <div className="border-4 border-green-800 shadow-2xl p-8" style={{
        background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
        {/* Masters-inspired header */}
        <div className="text-center mb-8">
          <div className="border-b-2 border-green-800 pb-4 mb-6">
            <h2 className="text-3xl font-serif font-bold text-green-900 mb-2" style={{
              textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              fontFamily: 'Georgia, serif'
            }}>Create Tournament</h2>
            <p className="text-sm text-green-800 font-semibold tracking-widest uppercase">9/9/9 Challenge</p>
          </div>

          <div className="flex justify-center items-center gap-6 text-2xl mb-4">
            <div className="text-center">
              <span className="block text-green-800">⛳</span>
              <span className="text-xs text-green-700 font-serif">IX HOLES</span>
            </div>
            <div className="text-center">
              <span className="block text-orange-700">🌭</span>
              <span className="text-xs text-green-700 font-serif">IX DOGS</span>
            </div>
            <div className="text-center">
              <span className="block text-amber-600">🍺</span>
              <span className="text-xs text-green-700 font-serif">IX BEERS</span>
            </div>
          </div>
        </div>
        
        {!shareUrl ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-serif font-semibold text-green-900 mb-2 tracking-wide">Tournament Name*</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 border-3 border-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none font-serif text-lg"
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
              <label className="block text-sm font-serif font-semibold text-green-900 mb-2 tracking-wide">Tournament Date*</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full p-4 border-3 border-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-green-900 mb-2 tracking-wide">Golf Course</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-4 border-3 border-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none font-serif text-lg"
                style={{
                  background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)',
                  fontFamily: 'Georgia, serif'
                }}
                placeholder="Augusta National Golf Club"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-serif font-semibold text-green-900 mb-2 tracking-wide">Tournament Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-4 border-3 border-green-800 focus:ring-4 focus:ring-green-300 focus:outline-none font-serif text-lg"
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
              className="w-full bg-gradient-to-r from-green-800 to-green-900 text-cream-50 p-4 font-bold hover:from-green-900 hover:to-green-800 disabled:from-gray-500 disabled:to-gray-600 transition-all duration-300 transform hover:scale-105 border-2 border-green-800 shadow-lg"
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
            <div className="bg-green-100 border-l-4 border-green-800 p-6">
              <h3 className="font-serif font-bold text-green-900 mb-3 text-xl">Tournament Created Successfully!</h3>
              <p className="text-sm font-serif text-green-800 mb-4">Share this exclusive invitation with participants:</p>
              <div className="border-3 border-green-800 p-4 break-all font-mono text-sm" style={{
                background: 'linear-gradient(145deg, #fefdf8, #f8f6f0)'
              }}>
                {shareUrl}
              </div>
            </div>

            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="w-full bg-gradient-to-r from-green-700 to-green-800 text-cream-50 p-4 font-bold hover:from-green-800 hover:to-green-900 transition-all duration-300 transform hover:scale-105 border-2 border-green-800 shadow-lg"
              style={{
                fontFamily: 'Georgia, serif',
                textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
              }}
            >
              COPY INVITATION LINK
            </button>

            <p className="text-sm text-green-700 font-serif italic">Redirecting to tournament leaderboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}