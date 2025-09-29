import SplitTheGChallenge from '@/components/SplitTheGChallenge';
import AugustaBackground from '@/components/ui/AugustaBackground';

export default function SplitTheGPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-yellow-50 to-gray-100 relative">
      <AugustaBackground variant="field" opacity={3} />
      <div className="relative z-10 py-8">
        <SplitTheGChallenge />
      </div>
    </div>
  );
}