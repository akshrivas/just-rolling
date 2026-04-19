'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLive } from '@/hooks/useLive';
import { useWallet } from '@/hooks/useWallet';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { Bet, LastResult } from '@/hooks/useGameEngine';

export type MessageType = 'info' | 'win' | 'loss';

type GameContextValue = {
  live: ReturnType<typeof useLive>;
  balance: number;
  currentBet: Bet | null;
  lastResult: LastResult | null;
  placeBet: (number: number, amount: number) => boolean;
  message: string;
  messageType: MessageType;
  showMessage: (msg: string, type: MessageType) => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUserId(u?.uid ?? null));
    return () => unsub();
  }, []);

  const live = useLive();
  const { balance, deduct, credit } = useWallet(userId);
  const { currentBet, lastResult, placeBet } = useGameEngine({
    live,
    deduct,
    credit,
    userId,
  });

  const [message, setMessage] = useState('Pick a number and place your bet 🎲');
  const [messageType, setMessageType] = useState<MessageType>('info');

  const showMessage = useCallback((msg: string, type: MessageType = 'info') => {
    setMessage(msg);
    setMessageType(type);
  }, []);

  // Win / loss feedback — fires once per resolved round
  const lastResultRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!lastResult) return;
    if (lastResultRoundShown.current === lastResult.roundId) return;
    lastResultRoundShown.current = lastResult.roundId;
    if (lastResult.status === 'WON') {
      showMessage(`🔥 Boom! You won ₹${lastResult.winAmount.toLocaleString()}`, 'win');
    } else {
      showMessage('Close one 😬 Try again', 'loss');
    }
  }, [lastResult, showMessage]);

  // Rolling countdown — fires once per round when timeLeft hits ≤ 3
  const rollingRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!live) return;
    if (live.timeLeft > 3) return;
    if (rollingRoundShown.current === live.round) return;
    rollingRoundShown.current = live.round;
    showMessage('Rolling… hold tight 🎲', 'info');
  }, [live, showMessage]);

  return (
    <GameContext.Provider
      value={{ live, balance, currentBet, lastResult, placeBet, message, messageType, showMessage }}
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

