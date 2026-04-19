'use client';

import { useEffect, useRef, useState } from 'react';
import BetGrid from '@/components/BetGrid';
import AmountSelector from '@/components/AmountSelector';
import BetAction from '@/components/BetAction';
import DiceDisplay from '@/components/DiceDisplay';
import ChatFeed from '@/components/ChatFeed';
import { useGame } from '@/context/GameContext';

export default function Home() {
  const { live, currentBet, placeBet, showBetPlaced, showLowBalance, isLoggedIn } =
    useGame();

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(100);

  // Derived: bet is active for this round
  const betPlaced = currentBet !== null && currentBet.roundId === live?.round;
  // Lock betting in the last 5 seconds to avoid round-boundary inconsistency
  const bettingLocked = (live?.timeLeft ?? 99) <= 5;
  const bettingDisabled = betPlaced || bettingLocked || !isLoggedIn;

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
    if (!selectedNumber || bettingLocked || !isLoggedIn) return;
    const ok = placeBet(selectedNumber, selectedAmount);
    if (ok) {
      showBetPlaced(selectedNumber, selectedAmount);
    } else {
      showLowBalance();
    }
  };

  return (
    <main className="flex-1 relative flex flex-col items-center px-3 pt-2 pb-3 gap-2 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-150 h-100 bg-purple-700/10 blur-3xl rounded-full" />
      </div>

      {/* Chat feed — fills remaining height, messages anchor to bottom */}
      <div className="relative flex-1 min-h-0 w-full max-w-md mx-auto flex flex-col justify-end overflow-hidden">
        <ChatFeed />
      </div>

      <div className="relative w-full max-w-md mx-auto bg-[#0D0D14] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 px-4 pt-2.5 pb-3">
        {/* Card header row */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-white/60 text-xs font-medium tracking-widest uppercase">
            Pool &amp; Stake
          </p>
          {live?.round != null && (
            <span className="text-[10px] text-white/45 font-medium tracking-wide">
              Round #{live.round}
            </span>
          )}
        </div>

        {/* Dice */}
        {live ? (
          <DiceDisplay
            value={live.previousResult}
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
        <div className="h-px bg-white/5 my-2" />

        {/* Betting controls — gated behind login */}
        <div className="relative">
          {!isLoggedIn && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-[#0D0D14]/80 backdrop-blur-sm">
              <span className="text-white/70 text-sm font-medium">Login to place bets</span>
              <span className="text-white/35 text-xs">Tap the Login button above ↑</span>
            </div>
          )}

          {/* Bet Grid */}
          <BetGrid
            selected={selectedNumber}
            onSelect={setSelectedNumber}
            disabled={bettingDisabled}
          />

          {/* Amount Selector */}
          <AmountSelector
            selected={selectedAmount}
            onSelect={setSelectedAmount}
            disabled={bettingDisabled}
          />

          {/* Bet Action */}
          <BetAction
            selectedNumber={selectedNumber}
            selectedAmount={selectedAmount}
            onBet={handleBet}
            betPlaced={betPlaced}
            bettingLocked={bettingLocked}
          />
        </div>
      </div>
    </main>
  );
}
