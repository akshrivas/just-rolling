'use client';

import { useLive } from '@/hooks/useLive';
import DiceDisplay from '@/components/DiceDisplay';

export default function LivePage() {
  const game = useLive();

  if (!game) return null;

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white flex items-center justify-center">
      <DiceDisplay
        value={game.result}
        previous={game.previousResult}
        timeLeft={game.timeLeft}
      />
    </main>
  );
}
