'use client';

import { useEffect, useState } from 'react';

export function useGame(timeLeft: number | undefined) {
  const [bets, setBets] = useState<Record<number, number>>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });

  const [selected, setSelected] = useState<number | null>(null);

  // 🔁 reset on new round
  useEffect(() => {
    if (timeLeft === 59) {
      setBets({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
      setSelected(null);
    }
  }, [timeLeft]);

  const placeBet = (num: number) => {
    setSelected(num);
    setBets((prev) => ({
      ...prev,
      [num]: prev[num] + 100,
    }));
  };

  const totalPool = Object.values(bets).reduce((a, b) => a + b, 0);
  const cut = Math.floor(totalPool * 0.1);
  const payout = totalPool - cut;

  return {
    bets,
    selected,
    placeBet,
    totalPool,
    payout,
    cut,
  };
}
