'use client';

import { useState } from 'react';
import BetGrid from '@/components/BetGrid';
import AmountSelector from '@/components/AmountSelector';
import BetAction from '@/components/BetAction';
import DiceDisplay from '@/components/DiceDisplay';
import { useLive } from '@/hooks/useLive';

export default function Home() {
  const live = useLive();

  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [selectedAmount, setSelectedAmount] = useState(100);

  const handleBet = () => {
    if (!selectedNumber) return;

    console.log('Bet placed:', {
      number: selectedNumber,
      amount: selectedAmount,
    });

    // next step: connect balance + result
  };

  return (
    <main className="min-h-screen bg-[#05060A] text-white flex flex-col items-center pt-10">
      {/* 🎲 DICE (HERO SECTION) */}
      <div className="mb-6">
        <DiceDisplay
          value={live?.result}
          previous={live?.previousResult}
          timer={live?.timeLeft}
        />
      </div>

      {/* 🎯 BET GRID */}
      <BetGrid selected={selectedNumber} onSelect={setSelectedNumber} />

      {/* 💰 AMOUNT SELECTOR */}
      <AmountSelector selected={selectedAmount} onSelect={setSelectedAmount} />

      {/* 🚀 BET ACTION */}
      <BetAction
        selectedNumber={selectedNumber}
        selectedAmount={selectedAmount}
        onBet={handleBet}
      />
    </main>
  );
}
