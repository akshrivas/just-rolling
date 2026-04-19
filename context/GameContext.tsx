'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLive } from '@/hooks/useLive';
import { useWallet } from '@/hooks/useWallet';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { Bet, LastResult } from '@/hooks/useGameEngine';

export type MessageType = 'info' | 'win' | 'loss';

// Pick a random item from a pool, avoiding the last shown value
function pick(pool: string[], last: string): string {
  const choices = pool.length > 1 ? pool.filter((m) => m !== last) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

const MESSAGES = {
  betPlaced: [
    'Locked in 🎯',
    "Bet's on 👀",
    "You're in 🔥",
    'Done. Let it ride 🎲',
  ],
  rolling: ['Rolling… 🎲', "Let's see 👀", 'Big moment… 🎯', 'Here we go 🔥'],
  win: (amount: string) => [
    `🔥 Boom! ₹${amount}!`,
    `That's a hit 💰 ₹${amount}`,
    `Nice one! ₹${amount} 🎉`,
    `Clean win 👌 ₹${amount}`,
  ],
  loss: ['Close one 😬', 'Not this time 👀', 'Missed it 🤏', 'Try again 🎯'],
  lowBalance: ['Not enough balance ⚠️', 'Low balance 👀'],
  idle: ['Pick a number 🎲', "What's your call? 👀", 'Place your bet 🎯'],
};

type GameContextValue = {
  live: ReturnType<typeof useLive>;
  balance: number;
  currentBet: Bet | null;
  lastResult: LastResult | null;
  placeBet: (number: number, amount: number) => boolean;
  message: string;
  messageType: MessageType;
  showMessage: (msg: string, type: MessageType) => void;
  showBetPlaced: () => void;
  showLowBalance: () => void;
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

  const [message, setMessage] = useState(() => pick(MESSAGES.idle, ''));
  const [messageType, setMessageType] = useState<MessageType>('info');

  const showMessage = useCallback((msg: string, type: MessageType = 'info') => {
    setMessage(msg);
    setMessageType(type);
  }, []);

  const showBetPlaced = useCallback(() => {
    setMessageType('info');
    setMessage((prev) => pick(MESSAGES.betPlaced, prev));
  }, []);

  const showLowBalance = useCallback(() => {
    setMessageType('loss');
    setMessage((prev) => pick(MESSAGES.lowBalance, prev));
  }, []);

  // Win / loss feedback — fires once per resolved round, with a short delay
  const lastResultRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!lastResult) return;
    if (lastResultRoundShown.current === lastResult.roundId) return;
    lastResultRoundShown.current = lastResult.roundId;
    const timer = setTimeout(() => {
      if (lastResult.status === 'WON') {
        setMessageType('win');
        setMessage((prev) =>
          pick(MESSAGES.win(lastResult.winAmount.toLocaleString()), prev),
        );
      } else {
        setMessageType('loss');
        setMessage((prev) => pick(MESSAGES.loss, prev));
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [lastResult]);

  // Rolling countdown — fires once per round when timeLeft hits ≤ 3
  const rollingRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!live) return;
    if (live.timeLeft > 3) return;
    if (rollingRoundShown.current === live.round) return;
    rollingRoundShown.current = live.round;
    setMessageType('info');
    setMessage((prev) => pick(MESSAGES.rolling, prev));
  }, [live]);

  return (
    <GameContext.Provider
      value={{
        live,
        balance,
        currentBet,
        lastResult,
        placeBet,
        message,
        messageType,
        showMessage,
        showBetPlaced,
        showLowBalance,
      }}
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
