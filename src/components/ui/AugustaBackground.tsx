interface AugustaBackgroundProps {
  variant?: 'circles' | 'pattern' | 'field';
  opacity?: number;
  className?: string;
}

export default function AugustaBackground({
  variant = 'field',
  opacity = 5,
  className = ''
}: AugustaBackgroundProps) {
  const backgroundImages = {
    circles: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    pattern: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    field: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Ccircle cx='5' cy='5' r='0.5'/%3E%3Ccircle cx='15' cy='5' r='0.5'/%3E%3Ccircle cx='10' cy='10' r='0.5'/%3E%3Ccircle cx='5' cy='15' r='0.5'/%3E%3Ccircle cx='15' cy='15' r='0.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  };

  return (
    <div className={`absolute inset-0 opacity-${opacity} ${className}`}>
      <div
        className="h-full w-full"
        style={{
          backgroundImage: backgroundImages[variant]
        }}
      />
    </div>
  );
}