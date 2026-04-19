'use client';

import { createContext, useContext } from 'react';
import { useLive } from '@/hooks/useLive';
import { useWallet } from '@/hooks/useWallet';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { Bet, RoundResult } from '@/hooks/useGameEngine';

type GameContextValue = {
  live: ReturnType<typeof useLive>;
  balance: number;
  currentBet: Bet | null;
  lastResult: RoundResult | null;
  history: RoundResult[];
  placeBet: (number: number, amount: number) => boolean;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const live = useLive();
  const { balance, deduct, credit } = useWallet();
  const { currentBet, lastResult, history, placeBet } = useGameEngine({
    live,
    deduct,
    credit,
  });

  return (
    <GameContext.Provider
      value={{ live, balance, currentBet, lastResult, history, placeBet }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}
