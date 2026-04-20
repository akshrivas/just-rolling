'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useLive } from '@/hooks/useLive';
import { useWallet } from '@/hooks/useWallet';
import { useGameEngine } from '@/hooks/useGameEngine';
import type { Bet, LastResult } from '@/hooks/useGameEngine';

export type GameState =
  | 'NO_LOGIN'
  | 'IDLE'
  | 'BET_ACTIVE'
  | 'RESOLVING'
  | 'RESULT_WIN'
  | 'RESULT_LOSS';

export type AccentName = 'purple' | 'amber' | 'red' | 'green' | 'zinc';

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
  betPlaced: ['Locked in 🎯', "Bet's on 👀", "You're in 🔥", 'Let it ride 🎲'],
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
  // ── Auth ──
  user: User | null;
  userPhotoUrl: string | null;
  isLoggedIn: boolean;
  authLoading: boolean;
  // ── Game state ──
  resultFlash: 'win' | 'loss' | null;
  gameState: GameState;
  accent: AccentName;
};

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      const raw = u?.photoURL || u?.providerData?.[0]?.photoURL || null;
      setUserPhotoUrl(raw ? raw.replace('s96-c', 's256-c') : null);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const userId = user?.uid ?? null;
  const isLoggedIn = user !== null;

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
  const [resultFlash, setResultFlash] = useState<'win' | 'loss' | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      addToChat(`${amount.toLocaleString()} coins on ${num} 🎯`, 'user');
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
      // Update message bar + trigger result flash
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      if (lastResult.status === 'WON') {
        setMessage(`🔥 Hit! +${lastResult.winAmount.toLocaleString()} coins`);
        setMessageType('win');
        setResultFlash('win');
        flashTimerRef.current = setTimeout(() => setResultFlash(null), 2500);
      } else {
        setMessage('Missed 🤏');
        setMessageType('loss');
        setResultFlash('loss');
        flashTimerRef.current = setTimeout(() => setResultFlash(null), 2000);
      }
      // Structured result bubble in chat
      if (lastResult.result !== -1) {
        addToChat('', 'system', {
          predicted: lastResult.predictedNumber,
          actual: lastResult.result,
          status: lastResult.status,
        });
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [lastResult, addToChat]);

  // Rolling countdown — fires once per round when timeLeft hits ≤ 3, only if a bet is active
  const rollingRoundShown = useRef<number | null>(null);
  useEffect(() => {
    if (!live) return;
    if (live.timeLeft > 3) return;
    if (rollingRoundShown.current === live.round) return;
    rollingRoundShown.current = live.round;
    if (currentBet && currentBet.roundId === live.round) {
      postSystem(MESSAGES.rolling, 'info');
    }
  }, [live, currentBet, postSystem]);

  // Cleanup flash timer on unmount
  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    [],
  );

  const gameState = useMemo<GameState>(() => {
    if (!isLoggedIn) return 'NO_LOGIN';
    if (resultFlash === 'win') return 'RESULT_WIN';
    if (resultFlash === 'loss') return 'RESULT_LOSS';
    if (live && live.timeLeft <= 3) return 'RESOLVING';
    if (currentBet && live && currentBet.roundId === live.round)
      return 'BET_ACTIVE';
    return 'IDLE';
  }, [isLoggedIn, resultFlash, live, currentBet]);

  const accent = useMemo<AccentName>(() => {
    switch (gameState) {
      case 'RESULT_WIN':
        return 'green';
      case 'RESULT_LOSS':
        return 'purple';
      case 'RESOLVING':
        return 'red';
      case 'BET_ACTIVE':
        return 'amber';
      case 'NO_LOGIN':
        return 'zinc';
      default:
        return 'purple';
    }
  }, [gameState]);

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
        user,
        userPhotoUrl,
        isLoggedIn,
        authLoading,
        resultFlash,
        gameState,
        accent,
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
