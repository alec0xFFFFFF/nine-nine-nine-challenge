'use client';

import { useState, useEffect } from 'react';

interface Challenge {
  icon1: string;
  text1: string;
  label1: string;
  icon2: string;
  text2: string;
  label2: string;
  icon3: string;
  text3: string;
  label3: string;
  name: string;
}

interface TournamentStatsProps {
  variant?: 'default' | 'compact';
  className?: string;
  interactive?: boolean;
  autoRotate?: boolean;
  onChallengeChange?: (challenge: Challenge) => void;
}

const challenges: Challenge[] = [
  {
    icon1: '⛳', text1: 'IX', label1: 'HOLES',
    icon2: '🌭', text2: 'IX', label2: 'DOGS',
    icon3: '🍺', text3: 'IX', label3: 'BEERS',
    name: '9/9/9 Golf Challenge'
  },
  {
    icon1: '⚾', text1: 'IX', label1: 'INNINGS',
    icon2: '🌮', text2: 'IX', label2: 'TACOS',
    icon3: '🍺', text3: 'IX', label3: 'BEERS',
    name: '9/9/9 Baseball Feast'
  },
  {
    icon1: '🎳', text1: 'IX', label1: 'FRAMES',
    icon2: '🍕', text2: 'IX', label2: 'SLICES',
    icon3: '🍺', text3: 'IX', label3: 'BEERS',
    name: '9/9/9 Bowling Marathon'
  },
  {
    icon1: '🥊', text1: 'IX', label1: 'ROUNDS',
    icon2: '🍔', text2: 'IX', label2: 'BURGERS',
    icon3: '🥃', text3: 'IX', label3: 'SHOTS',
    name: '9/9/9 Fight Night'
  },
  {
    icon1: '🏈', text1: 'IX', label1: 'QUARTERS',
    icon2: '🍗', text2: 'IX', label2: 'WINGS',
    icon3: '🍺', text3: 'IX', label3: 'BEERS',
    name: '9/9/9 Tailgate Throwdown'
  },
  {
    icon1: '🎾', text1: 'IX', label1: 'SETS',
    icon2: '🥪', text2: 'IX', label2: 'CLUBS',
    icon3: '🍾', text3: 'IX', label3: 'MIMOSAS',
    name: '9/9/9 Country Club'
  },
  {
    icon1: '⛷️', text1: 'IX', label1: 'RUNS',
    icon2: '🧀', text2: 'IX', label2: 'FONDUES',
    icon3: '🥃', text3: 'IX', label3: 'SCHNAPPS',
    name: '9/9/9 Ski Lodge'
  },
  {
    icon1: '🎮', text1: 'IX', label1: 'GAMES',
    icon2: '🍜', text2: 'IX', label2: 'RAMEN',
    icon3: '🧋', text3: 'IX', label3: 'BOBAS',
    name: '9/9/9 Gamer Grind'
  },
  {
    icon1: '🍺', text1: 'G', label1: 'SPLIT',
    icon2: '📸', text2: 'IX', label2: 'PHOTOS',
    icon3: '🏆', text3: 'MAX', label3: 'SCORE',
    name: 'Split the G Challenge'
  }
];

export default function TournamentStats({
  variant = 'default',
  className = '',
  interactive = false,
  autoRotate = false,
  onChallengeChange
}: TournamentStatsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const isCompact = variant === 'compact';
  const currentChallenge = challenges[currentIndex];
  const isGuinnessChallenge = currentChallenge.name === 'Split the G Challenge';

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const nextIndex = (currentIndex + 1) % challenges.length;
    setCurrentIndex(nextIndex);
    onChallengeChange?.(challenges[nextIndex]);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!interactive) return;
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!interactive) return;
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!interactive) return;
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > 50;
    if (isUpSwipe) {
      handleNext();
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    if (autoRotate && !interactive) {
      const interval = setInterval(handleNext, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRotate, interactive, currentIndex]);

  return (
    <div
      className={`grid grid-cols-3 gap-4 text-center ${className} ${interactive ? 'cursor-pointer select-none' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={interactive ? handleNext : undefined}
    >
      <div className={`${isGuinnessChallenge ? 'bg-yellow-100/70' : 'bg-secondary/50'} ${isCompact ? 'p-2' : 'p-4'} transition-all duration-300 ${isAnimating ? 'transform -translate-y-2 opacity-50' : ''}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} ${isGuinnessChallenge ? 'text-yellow-600' : 'text-primary'}`}>{currentChallenge.icon1}</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold ${isGuinnessChallenge ? 'text-yellow-800' : 'text-primary'}`}>{currentChallenge.text1}</div>
        <div className={`text-xs ${isGuinnessChallenge ? 'text-yellow-700' : 'text-muted-foreground'} font-serif ${isCompact ? 'text-[10px]' : ''}`}>{currentChallenge.label1}</div>
      </div>
      <div className={`${isGuinnessChallenge ? 'bg-gray-800/10' : 'bg-secondary/50'} ${isCompact ? 'p-2' : 'p-4'} transition-all duration-300 ${isAnimating ? 'transform -translate-y-2 opacity-50' : ''}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} ${isGuinnessChallenge ? 'text-gray-800' : 'text-orange-600'}`}>{currentChallenge.icon2}</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold ${isGuinnessChallenge ? 'text-gray-800' : 'text-primary'}`}>{currentChallenge.text2}</div>
        <div className={`text-xs ${isGuinnessChallenge ? 'text-gray-700' : 'text-muted-foreground'} font-serif ${isCompact ? 'text-[10px]' : ''}`}>{currentChallenge.label2}</div>
      </div>
      <div className={`${isGuinnessChallenge ? 'bg-yellow-600/20' : 'bg-secondary/50'} ${isCompact ? 'p-2' : 'p-4'} transition-all duration-300 ${isAnimating ? 'transform -translate-y-2 opacity-50' : ''}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} ${isGuinnessChallenge ? 'text-yellow-700' : 'text-amber-600'}`}>{currentChallenge.icon3}</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold ${isGuinnessChallenge ? 'text-yellow-800' : 'text-primary'}`}>{currentChallenge.text3}</div>
        <div className={`text-xs ${isGuinnessChallenge ? 'text-yellow-700' : 'text-muted-foreground'} font-serif ${isCompact ? 'text-[10px]' : ''}`}>{currentChallenge.label3}</div>
      </div>

      {interactive && (
        <div className="col-span-3 mt-2">
          <div className="text-xs text-muted-foreground font-serif text-center">
            {isCompact ? 'TAP' : 'SWIPE UP'} TO CHANGE CHALLENGE
          </div>
          <div className="flex justify-center mt-1 gap-1">
            {challenges.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 transition-all duration-200 ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}