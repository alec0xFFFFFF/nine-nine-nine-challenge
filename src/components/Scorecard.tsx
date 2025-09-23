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

const beerTypes = [
  'Lager', 'IPA', 'Stout', 'Pilsner', 'Wheat', 'Ale', 'Porter', 'Other'
];

export default function Scorecard() {
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/scores/my-scores');
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
      const res = await fetch('/api/scores/update', {
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
    <div className="max-w-md mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">My Scorecard</h2>
        
        <div className="grid grid-cols-3 gap-2 mb-6 text-center">
          <div className="bg-blue-100 rounded p-2">
            <div className="text-xs text-gray-600">Strokes</div>
            <div className="text-xl font-bold">{totals.strokes}</div>
          </div>
          <div className="bg-orange-100 rounded p-2">
            <div className="text-xs text-gray-600">Hot Dogs</div>
            <div className="text-xl font-bold">{totals.hotDogs}/9</div>
          </div>
          <div className="bg-yellow-100 rounded p-2">
            <div className="text-xs text-gray-600">Beers</div>
            <div className="text-xl font-bold">{totals.beers}/9</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex gap-1 justify-between mb-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(hole => (
              <button
                key={hole}
                onClick={() => setCurrentHole(hole)}
                className={`w-10 h-10 rounded-full font-bold transition-colors ${
                  currentHole === hole
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {hole}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="text-lg font-semibold text-center">Hole {currentHole}</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Strokes</label>
            <input
              type="number"
              min="1"
              max="20"
              value={currentScore.strokes || ''}
              onChange={(e) => updateScore(currentHole, 'strokes', e.target.value ? parseInt(e.target.value) : null)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter strokes"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hot Dogs Consumed</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => updateScore(currentHole, 'hot_dogs_consumed', num)}
                  className={`flex-1 p-2 rounded transition-colors ${
                    currentScore.hot_dogs_consumed === num
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Beers Consumed</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3].map(num => (
                <button
                  key={num}
                  onClick={() => updateScore(currentHole, 'beers_consumed', num)}
                  className={`flex-1 p-2 rounded transition-colors ${
                    currentScore.beers_consumed === num
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  disabled={loading}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {currentScore.beers_consumed > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1">Beer Type</label>
              <select
                value={currentScore.beer_type || ''}
                onChange={(e) => updateScore(currentHole, 'beer_type', e.target.value)}
                className="w-full p-2 border rounded-lg"
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