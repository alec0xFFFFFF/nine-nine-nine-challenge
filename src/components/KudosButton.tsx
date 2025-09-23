'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { KUDOS_TYPES } from '@/lib/db-v2';

interface KudosButtonProps {
  eventCode: string;
  participantId: number;
  participantName: string;
}

export default function KudosButton({ eventCode, participantId, participantName }: KudosButtonProps) {
  const [showKudosMenu, setShowKudosMenu] = useState(false);
  const [giving, setGiving] = useState(false);
  const [givenKudos, setGivenKudos] = useState<string[]>([]);

  const handleGiveKudos = async (kudosType: string) => {
    if (givenKudos.includes(kudosType)) {
      toast.error('You already gave this kudos!');
      return;
    }

    setGiving(true);

    try {
      const res = await fetch(`/api/events/${eventCode}/kudos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          kudosType
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error);
      }

      if (data.alreadyGiven) {
        toast.error('You already gave this kudos!');
        setGivenKudos([...givenKudos, kudosType]);
      } else {
        const kudos = KUDOS_TYPES[kudosType as keyof typeof KUDOS_TYPES];
        toast.success(`${kudos.emoji} ${kudos.name} given to ${participantName}!`);
        setGivenKudos([...givenKudos, kudosType]);
      }
      
      setShowKudosMenu(false);
    } catch (error: any) {
      toast.error('Failed to give kudos');
    }
    
    setGiving(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowKudosMenu(!showKudosMenu)}
        className="px-3 py-1 bg-yellow-400 text-black rounded-full text-sm font-semibold hover:bg-yellow-500 transition-colors"
      >
        👏 Give Kudos
      </button>

      {showKudosMenu && (
        <div className="absolute z-10 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-2 max-h-96 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
            Choose a Kudos
          </div>
          <div className="space-y-1">
            {Object.entries(KUDOS_TYPES).map(([key, kudos]) => (
              <button
                key={key}
                onClick={() => handleGiveKudos(key)}
                disabled={giving || givenKudos.includes(key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  givenKudos.includes(key)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-yellow-50 hover:border-yellow-300 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-2xl">{kudos.emoji}</span>
                  <div>
                    <div className="font-semibold text-sm">{kudos.name}</div>
                    <div className="text-xs text-gray-600">{kudos.description}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {showKudosMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowKudosMenu(false)}
        />
      )}
    </div>
  );
}