interface MastersHeaderProps {
  title: string;
  subtitle: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function MastersHeader({
  title,
  subtitle,
  variant = 'dark',
  size = 'lg',
  className = ''
}: MastersHeaderProps) {
  const isLight = variant === 'light';

  const titleSizes = {
    sm: 'text-3xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const subtitleSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={`text-center ${className}`}>
      <h1
        className={`${titleSizes[size]} font-serif font-bold mb-4 ${
          isLight ? 'text-primary' : 'text-white'
        }`}
        style={{
          textShadow: isLight
            ? '1px 1px 2px rgba(0,0,0,0.1)'
            : '2px 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'Georgia, serif'
        }}
      >
        {title}
      </h1>
      <p
        className={`${subtitleSizes[size]} font-serif italic ${
          isLight ? 'text-muted-foreground' : 'text-white/90'
        }`}
        style={{
          textShadow: isLight
            ? 'none'
            : '1px 1px 2px rgba(0,0,0,0.3)'
        }}
      >
        {subtitle}
      </p>
    </div>
  );
}