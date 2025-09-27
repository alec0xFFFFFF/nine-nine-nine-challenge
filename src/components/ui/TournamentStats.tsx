interface TournamentStatsProps {
  variant?: 'default' | 'compact';
  className?: string;
}

export default function TournamentStats({ variant = 'default', className = '' }: TournamentStatsProps) {
  const isCompact = variant === 'compact';

  return (
    <div className={`grid grid-cols-3 gap-4 text-center ${className}`}>
      <div className={`bg-secondary/50 ${isCompact ? 'p-2' : 'p-4'}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} text-primary`}>⛳</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold text-primary`}>IX</div>
        <div className={`text-xs text-muted-foreground font-serif ${isCompact ? 'text-[10px]' : ''}`}>HOLES</div>
      </div>
      <div className={`bg-secondary/50 ${isCompact ? 'p-2' : 'p-4'}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} text-orange-600`}>🌭</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold text-primary`}>IX</div>
        <div className={`text-xs text-muted-foreground font-serif ${isCompact ? 'text-[10px]' : ''}`}>DOGS</div>
      </div>
      <div className={`bg-secondary/50 ${isCompact ? 'p-2' : 'p-4'}`}>
        <div className={`${isCompact ? 'text-lg' : 'text-2xl'} text-amber-600`}>🍺</div>
        <div className={`${isCompact ? 'text-xs' : 'text-sm'} font-serif font-semibold text-primary`}>IX</div>
        <div className={`text-xs text-muted-foreground font-serif ${isCompact ? 'text-[10px]' : ''}`}>BEERS</div>
      </div>
    </div>
  );
}