'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface HoleScore {
  hole_number: number;
  strokes: number | null;
  hot_dogs_consumed: number;
  beers_consumed: number;
  beer_type: string | null;
}

interface EventScorecardProps {
  eventCode: string;
}

const beerTypes = [
  'Lager', 'IPA', 'Stout', 'Pilsner', 'Wheat', 'Ale', 'Porter', 'Other'
];

export default function EventScorecard({ eventCode }: EventScorecardProps) {
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScores();
  }, [eventCode]);

  const fetchScores = async () => {
    try {
      const res = await fetch(`/api/events/${eventCode}/scores/my-scores`);
      const data = await res.json();
      if (data.scores) {
        setScores(data.scores);
      }
    } catch (error) {
      toast.error('Failed to load scores');
    }
  };

  const updateScore = async (holeNumber: number, field: string, value: any) => {
    const score = scores.find(s => s.hole_number === holeNumber) || {
      hole_number: holeNumber,
      strokes: null,
      hot_dogs_consumed: 0,
      beers_consumed: 0,
      beer_type: null
    };

    const updatedScore = { ...score, [field]: value };
    
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventCode}/scores/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holeNumber,
          strokes: updatedScore.strokes,
          hotDogs: updatedScore.hot_dogs_consumed,
          beers: updatedScore.beers_consumed,
          beerType: updatedScore.beer_type
        })
      });

      if (res.ok) {
        await fetchScores();
        toast.success(`Hole ${holeNumber} updated!`);
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      toast.error('Failed to update score');
    }
    setLoading(false);
  };

  const getHoleScore = (holeNumber: number) => {
    return scores.find(s => s.hole_number === holeNumber) || {
      hole_number: holeNumber,
      strokes: null,
      hot_dogs_consumed: 0,
      beers_consumed: 0,
      beer_type: null
    };
  };

  const getTotals = () => {
    return scores.reduce((acc, score) => ({
      strokes: acc.strokes + (score.strokes || 0),
      hotDogs: acc.hotDogs + score.hot_dogs_consumed,
      beers: acc.beers + score.beers_consumed
    }), { strokes: 0, hotDogs: 0, beers: 0 });
  };

  const totals = getTotals();
  const currentScore = getHoleScore(currentHole);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white border border-gray-300 shadow-sm">
        {/* Classic scorecard header */}
        <div className="border-b-2 border-green-700 bg-green-50 px-6 py-4">
          <h2 className="text-2xl font-serif font-bold text-green-800 text-center">SCORECARD</h2>
        </div>
        
        {/* Totals section */}
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center border-r border-gray-200 pr-6">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Total Strokes</div>
              <div className="text-3xl font-bold text-gray-900">{totals.strokes}</div>
            </div>
            <div className="text-center border-r border-gray-200 pr-6">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Hot Dogs</div>
              <div className="text-3xl font-bold text-orange-600">{totals.hotDogs}<span className="text-lg text-gray-500">/9</span></div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Beers</div>
              <div className="text-3xl font-bold text-yellow-600">{totals.beers}<span className="text-lg text-gray-500">/9</span></div>
            </div>
          </div>
        </div>

        {/* Hole selector */}
        <div className="border-b border-gray-200 p-6">
          <div className="grid grid-cols-9 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
              <button
                key={hole}
                onClick={() => setCurrentHole(hole)}
                className={`aspect-square flex items-center justify-center font-bold border-2 transition-colors ${
                  currentHole === hole
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                {hole}
              </button>
            ))}
          </div>
        </div>

        {/* Current hole details */}
        <div className="p-6 space-y-6">
          <div className="text-center border-b border-gray-200 pb-4">
            <h3 className="text-2xl font-serif font-bold text-green-800">HOLE {currentHole}</h3>
          </div>
          
          {/* Strokes input */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 uppercase tracking-wide">Strokes</label>
            <input
              type="number"
              min="1"
              max="20"
              value={currentScore.strokes || ''}
              onChange={(e) => updateScore(currentHole, 'strokes', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-3 border-2 border-gray-300 focus:border-green-700 focus:outline-none text-lg font-semibold text-center"
              placeholder="0"
              disabled={loading}
            />
          </div>

          {/* Hot Dogs */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 uppercase tracking-wide">🌭 Hot Dogs Consumed</label>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => updateScore(currentHole, 'hot_dogs_consumed', num)}
                  className={`aspect-square flex items-center justify-center text-lg font-bold border-2 transition-colors ${
                    currentScore.hot_dogs_consumed === num
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                  disabled={loading}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Beers */}
          <div>
            <label className="block text-sm font-medium mb-3 text-gray-700 uppercase tracking-wide">🍺 Beers Consumed</label>
            <div className="grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => updateScore(currentHole, 'beers_consumed', num)}
                  className={`aspect-square flex items-center justify-center text-lg font-bold border-2 transition-colors ${
                    currentScore.beers_consumed === num
                      ? 'bg-yellow-600 text-white border-yellow-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-300 hover:bg-yellow-50'
                  }`}
                  disabled={loading}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Beer type selector */}
          {currentScore.beers_consumed > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700 uppercase tracking-wide">Beer Type</label>
              <select
                value={currentScore.beer_type || ''}
                onChange={(e) => updateScore(currentHole, 'beer_type', e.target.value)}
                className="w-full p-3 border-2 border-gray-300 focus:border-green-700 focus:outline-none text-base"
                disabled={loading}
              >
                <option value="">Select beer type</option>
                {beerTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}