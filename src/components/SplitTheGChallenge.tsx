'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface SplitScore {
  id: string;
  participantName: string;
  imageUrl: string;
  score: number;
  timestamp: Date;
  description: string;
}

interface SplitTheGChallengeProps {
  eventCode?: string;
}

export default function SplitTheGChallenge({ eventCode }: SplitTheGChallengeProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<SplitScore[]>([
    {
      id: '1',
      participantName: 'Master Pourer',
      imageUrl: '',
      score: 98,
      timestamp: new Date(),
      description: 'Perfect split - crisp line between foam and beer'
    },
    {
      id: '2',
      participantName: 'Guinness Pro',
      imageUrl: '',
      score: 87,
      timestamp: new Date(),
      description: 'Excellent technique with minor foam irregularity'
    },
    {
      id: '3',
      participantName: 'Foam Artist',
      imageUrl: '',
      score: 76,
      timestamp: new Date(),
      description: 'Good split with slightly uneven foam layer'
    }
  ]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeGSplit = async () => {
    if (!selectedImage || !imagePreview) return;

    setLoading(true);

    // Create an image element to load the preview
    const img = new Image();
    img.onload = () => {
      // Create canvas for image analysis
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setLoading(false);
        return;
      }

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      // Find the foam line (transition from light foam to dark beer)
      let foamLineY = -1;
      let maxTransition = 0;
      let avgBrightness: number[] = [];

      // Calculate average brightness for each row
      for (let y = 0; y < canvas.height; y++) {
        let rowBrightness = 0;
        let pixelCount = 0;

        for (let x = 0; x < canvas.width; x++) {
          const idx = (y * canvas.width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const brightness = (r + g + b) / 3;

          rowBrightness += brightness;
          pixelCount++;
        }

        avgBrightness[y] = rowBrightness / pixelCount;

        // Find the sharpest transition (foam to beer boundary)
        if (y > 0) {
          const transition = avgBrightness[y - 1] - avgBrightness[y];
          if (transition > maxTransition) {
            maxTransition = transition;
            foamLineY = y;
          }
        }
      }

      // Calculate foam line position as percentage from top
      const foamLinePosition = foamLineY / canvas.height;

      // SCORING BASED ON G-SPLIT ZONES
      // The G in GUINNESS is typically positioned around 35-45% from top of glass
      // Perfect split is when foam line goes through center of G (around 40%)

      let score = 0;
      let zoneDescription = '';

      if (foamLinePosition < 0.30) {
        // Too high - above the G
        score = 60 + (foamLinePosition / 0.30) * 10;
        zoneDescription = 'Foam line too high - above the G';
      } else if (foamLinePosition >= 0.30 && foamLinePosition < 0.375) {
        // Good - top half of G (3.75 zone)
        const distanceFromPerfect = Math.abs(foamLinePosition - 0.375);
        score = 75 + (1 - distanceFromPerfect / 0.075) * 10;
        zoneDescription = 'Good pour - foam line in upper G';
      } else if (foamLinePosition >= 0.375 && foamLinePosition < 0.425) {
        // PERFECT - center of G (5.0 zone)
        const distanceFromCenter = Math.abs(foamLinePosition - 0.40);
        score = 90 + (1 - distanceFromCenter / 0.025) * 10;
        zoneDescription = 'PERFECT! Foam line splits the G perfectly';
      } else if (foamLinePosition >= 0.425 && foamLinePosition < 0.475) {
        // Good - bottom half of G (3.75 zone)
        const distanceFromPerfect = Math.abs(foamLinePosition - 0.425);
        score = 75 + (1 - distanceFromPerfect / 0.05) * 10;
        zoneDescription = 'Good pour - foam line in lower G';
      } else if (foamLinePosition >= 0.475 && foamLinePosition < 0.55) {
        // Below G but acceptable
        score = 60 + (1 - (foamLinePosition - 0.475) / 0.075) * 10;
        zoneDescription = 'Foam line too low - below the G';
      } else {
        // Way too low
        score = 40 + (1 - foamLinePosition) * 20;
        zoneDescription = 'Over-poured - need more foam';
      }

      // Bonus points for sharp transition
      const sharpnessBonus = Math.min(5, maxTransition / 20);
      score = Math.round(Math.min(100, score + sharpnessBonus));

      // Generate detailed feedback
      const foamPercentage = Math.round(foamLinePosition * 100);
      let description = `${zoneDescription}. Foam line at ${foamPercentage}% from top.`;

      if (score >= 95) {
        description += ' Legendary G-split achieved!';
      } else if (score >= 85) {
        description += ' Excellent positioning through the G.';
      } else if (score >= 75) {
        description += ' Good attempt, aim for center of G.';
      } else {
        description += ' Keep practicing to hit the G sweet spot.';
      }

      const newScore: SplitScore = {
        id: Date.now().toString(),
        participantName: 'You',
        imageUrl: imagePreview,
        score: score,
        timestamp: new Date(),
        description: description
      };

      setScores(prev => [newScore, ...prev].slice(0, 10));
      setLoading(false);
    };

    img.src = imagePreview;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-600';
    if (score >= 80) return 'text-yellow-700';
    if (score >= 70) return 'text-yellow-800';
    return 'text-gray-600';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 95) return 'LEGENDARY SPLIT';
    if (score >= 90) return 'MASTER POURER';
    if (score >= 85) return 'EXPERT LEVEL';
    if (score >= 80) return 'SKILLED TECHNIQUE';
    if (score >= 70) return 'GOOD ATTEMPT';
    return 'KEEP PRACTICING';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-serif font-bold text-yellow-800 mb-2">Split the G Challenge</h1>
        <p className="text-lg text-gray-700 font-serif italic">"The Perfect Pour Competition"</p>
        <div className="mt-4 text-sm text-gray-600 font-serif">
          Upload a photo of your Guinness pour and get scored on how perfectly you split the G!
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="border-2 border-yellow-600/30 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-yellow-800 text-center">
              🍺 Submit Your Pour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="border-2 border-dashed border-yellow-400 p-8 bg-yellow-100/50">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Guinness pour preview"
                      className="max-w-full h-64 object-contain mx-auto border-2 border-yellow-600"
                    />
                    <p className="text-sm text-yellow-700 font-serif">Perfect! Ready to analyze your pour.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-6xl">📸</div>
                    <p className="text-yellow-700 font-serif">
                      Click to upload your Guinness photo
                    </p>
                    <p className="text-xs text-yellow-600 font-serif">
                      Best results: Clear photo of full pint glass showing foam separation
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {selectedImage && (
              <Button
                onClick={analyzeGSplit}
                disabled={loading}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-serif text-lg py-3"
              >
                {loading ? 'ANALYZING POUR...' : 'SCORE MY G-SPLIT'}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-2 border-gray-800/30 bg-gray-50/50">
          <CardHeader>
            <CardTitle className="text-2xl font-serif text-gray-800 text-center">
              🏆 Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={score.id}
                  className={`p-4 border-2 transition-all ${
                    index === 0
                      ? 'border-yellow-500 bg-yellow-100/80'
                      : index === 1
                      ? 'border-gray-400 bg-gray-100/80'
                      : index === 2
                      ? 'border-yellow-600 bg-yellow-50/80'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-500' :
                        index === 2 ? 'text-yellow-700' : 'text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-gray-800">
                          {score.participantName}
                        </div>
                        <div className="text-xs text-gray-600 font-serif">
                          {score.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                        {score.score}
                      </div>
                      <div className="text-xs font-serif text-gray-600">
                        {getScoreDescription(score.score)}
                      </div>
                    </div>
                  </div>
                  {score.imageUrl && (
                    <img
                      src={score.imageUrl}
                      alt="Guinness pour"
                      className="w-full h-32 object-cover border border-gray-300 mb-2"
                    />
                  )}
                  <p className="text-sm text-gray-700 font-serif italic">
                    {score.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="border-2 border-yellow-600/30 bg-gradient-to-r from-yellow-50 to-gray-50">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-gray-800 text-center">
            How to Score the Perfect G-Split
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Visual Guide */}
            <div className="bg-white p-6 border-2 border-yellow-600/50">
              <h4 className="font-serif font-bold text-yellow-800 text-center mb-4">G-Split Scoring Zones</h4>
              <div className="relative h-64 max-w-xs mx-auto bg-gradient-to-b from-yellow-100 via-gray-100 to-gray-900 border-4 border-gray-800">
                {/* Zone markers */}
                <div className="absolute left-0 right-0 top-[30%] border-t-2 border-orange-400 opacity-70">
                  <span className="absolute -left-16 text-xs text-orange-600 font-serif">Too High</span>
                </div>
                <div className="absolute left-0 right-0 top-[37.5%] border-t-2 border-green-400 opacity-70">
                  <span className="absolute -left-16 text-xs text-green-600 font-serif">3.75</span>
                </div>
                <div className="absolute left-0 right-0 top-[40%] border-t-4 border-yellow-500">
                  <span className="absolute -left-16 text-sm text-yellow-700 font-serif font-bold">5.0</span>
                </div>
                <div className="absolute left-0 right-0 top-[42.5%] border-t-2 border-green-400 opacity-70">
                  <span className="absolute -left-16 text-xs text-green-600 font-serif">3.75</span>
                </div>
                <div className="absolute left-0 right-0 top-[47.5%] border-t-2 border-orange-400 opacity-70">
                  <span className="absolute -left-16 text-xs text-orange-600 font-serif">Too Low</span>
                </div>

                {/* G Letter Representation */}
                <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 text-6xl font-bold text-white/30 font-serif">
                  G
                </div>

                {/* Labels */}
                <div className="absolute top-2 left-2 text-xs text-yellow-700 font-serif">FOAM</div>
                <div className="absolute bottom-2 left-2 text-xs text-gray-300 font-serif">BEER</div>
              </div>

              <div className="mt-4 text-center text-sm text-gray-700 font-serif">
                <strong>Perfect Score (5.0):</strong> Foam line splits directly through center of G<br />
                <span className="text-green-600">Good Score (3.75):</span> Foam line in upper or lower half of G<br />
                <span className="text-orange-600">Keep Practicing:</span> Foam line above or below the G
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="text-3xl">🍺</div>
                <h4 className="font-serif font-bold text-yellow-800">Target the G</h4>
                <p className="text-sm text-gray-700 font-serif">
                  Pour to position foam line through the center of the GUINNESS "G" logo
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">📏</div>
                <h4 className="font-serif font-bold text-yellow-800">40% Mark</h4>
                <p className="text-sm text-gray-700 font-serif">
                  The G is positioned around 40% from the top of the glass
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl">📸</div>
                <h4 className="font-serif font-bold text-yellow-800">Clear Photo</h4>
                <p className="text-sm text-gray-700 font-serif">
                  Show the full glass with GUINNESS logo visible for accurate scoring
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}