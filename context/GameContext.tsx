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

export type ChatMessage = {
  id: number;
  sender: 'user' | 'system';
  text: string;
  resultPayload?: {
    predicted: number;
    actual: number;
    status: 'WON' | 'LOST';
  };
};

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
    'Let it ride 🎲',
  ],
  rolling: ['Rolling… 🎲'],
  lowBalance: ['Not enough balance ⚠️', 'Low balance 👀'],
  idle: ['Place your bet 🎯'],
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
  showBetPlaced: (num: number, amount: number) => void;
  showLowBalance: () => void;
  chatMessages: ChatMessage[];
  userPhotoUrl: string | null;
  isLoggedIn: boolean;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUserId(u?.uid ?? null);
      const raw = u?.photoURL || u?.providerData?.[0]?.photoURL || null;
      setUserPhotoUrl(raw ? raw.replace('s96-c', 's256-c') : null);
    });
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const showMessage = useCallback((msg: string, type: MessageType = 'info') => {
    setMessage(msg);
    setMessageType(type);
  }, []);

  // Add a message to the chat feed (max 6 kept)
  const chatIdRef = useRef(0);
  const addToChat = useCallback(
    (
      text: string,
      sender: 'user' | 'system',
      resultPayload?: ChatMessage['resultPayload'],
    ) => {
      const id = ++chatIdRef.current;
      setChatMessages((prev) => {
        const next = [...prev, { id, sender, text, resultPayload }];
        return next.length > 6 ? next.slice(-6) : next;
      });
    },
    [],
  );

  // Post a system message to both the bar and the chat feed
  const lastSysMsgRef = useRef('');
  const postSystem = useCallback(
    (pool: string[], type: MessageType) => {
      const choices =
        pool.length > 1
          ? pool.filter((m) => m !== lastSysMsgRef.current)
          : pool;
      const m = choices[Math.floor(Math.random() * choices.length)];
      lastSysMsgRef.current = m;
      setMessage(m);
      setMessageType(type);
      addToChat(m, 'system');
    },
    [addToChat],
  );

  const showBetPlaced = useCallback(
    (num: number, amount: number) => {
      addToChat(`₹${amount.toLocaleString()} on ${num} 🎯`, 'user');
      postSystem(MESSAGES.betPlaced, 'info');
    },
    [addToChat, postSystem],
  );

  const showLowBalance = useCallback(() => {
    postSystem(MESSAGES.lowBalance, 'loss');
  }, [postSystem]);

  // Win / loss feedback — fires once per resolved round, with a short delay
  const lastResultRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!lastResult) return;
    if (lastResultRoundShown.current === lastResult.roundId) return;
    lastResultRoundShown.current = lastResult.roundId;
    const timer = setTimeout(() => {
      // Update message bar
      if (lastResult.status === 'WON') {
        setMessage(`🔥 Hit! +₹${lastResult.winAmount.toLocaleString()}`);
        setMessageType('win');
      } else {
        setMessage('Missed 🤏');
        setMessageType('loss');
      }
      // Structured result bubble in chat
      if (lastResult.result !== -1) {
        addToChat(
          '',
          'system',
          {
            predicted: lastResult.predictedNumber,
            actual: lastResult.result,
            status: lastResult.status,
          },
        );
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [lastResult, addToChat]);

  // Rolling countdown — fires once per round when timeLeft hits ≤ 3
  const rollingRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!live) return;
    if (live.timeLeft > 3) return;
    if (rollingRoundShown.current === live.round) return;
    rollingRoundShown.current = live.round;
    postSystem(MESSAGES.rolling, 'info');
  }, [live, postSystem]);

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
        chatMessages,
        userPhotoUrl,
        isLoggedIn: userId !== null,
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
