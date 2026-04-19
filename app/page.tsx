'use client';

import { useEffect, useRef, useState } from 'react';
import BetGrid from '@/components/BetGrid';
import AmountSelector from '@/components/AmountSelector';
import BetAction from '@/components/BetAction';
import DiceDisplay from '@/components/DiceDisplay';
import { useGame } from '@/context/GameContext';

export default function Home() {
  const { live, currentBet, lastResult, placeBet } = useGame();

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(100);

  // Derived: bet is active for this round
  const betPlaced = currentBet !== null && currentBet.roundId === live?.round;

  const prevRound = useRef<number | null>(null);

  // Reset number selection when a new round begins
  useEffect(() => {
    if (live?.round == null) return;
    if (prevRound.current !== null && live.round !== prevRound.current) {
      setSelectedNumber(null);
    }
    prevRound.current = live.round;
  }, [live?.round]);

  const handleBet = () => {
    if (!selectedNumber) return;
    placeBet(selectedNumber, selectedAmount);
  };

  return (
    <main className="flex-1 relative flex items-center justify-center px-4 py-4 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-150 h-100 bg-purple-700/10 blur-3xl rounded-full" />
      </div>

      <div className="relative w-full max-w-md bg-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 px-6 pt-5 pb-6">
        {/* Card header row */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-white/30 text-xs font-medium tracking-widest uppercase">
            Pool &amp; Stake
          </p>
          {live?.round != null && (
            <span className="text-[10px] text-white/20 font-medium tracking-wide">
              Round #{live.round}
            </span>
          )}
        </div>

        {/* Dice */}
        {live ? (
          <DiceDisplay
            value={live.result}
            previous={live.previousResult}
            timeLeft={live.timeLeft}
            roundDuration={live.roundDuration}
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-28 h-28 rounded-3xl bg-[#1A1A22] animate-pulse" />
            <div className="w-full h-0.75 rounded-full bg-[#1A1A22] animate-pulse mt-4" />
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-white/5 my-5" />

        {/* Bet Grid */}
        <BetGrid
          selected={selectedNumber}
          onSelect={setSelectedNumber}
          disabled={betPlaced}
        />

        {/* Amount Selector */}
        <AmountSelector
          selected={selectedAmount}
          onSelect={setSelectedAmount}
          disabled={betPlaced}
        />

        {/* Bet Action */}
        <BetAction
          selectedNumber={selectedNumber}
          selectedAmount={selectedAmount}
          onBet={handleBet}
          betPlaced={betPlaced}
          lastResult={lastResult}
        />
      </div>
    </main>
  );
}
