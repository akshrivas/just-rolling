'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveData } from './useLive';

const MULTIPLIER = 5.4;

function gameKey(userId: string) {
  return `jr_game_${userId}`;
}

export type Bet = {
  roundId: number;
  number: number;
  amount: number;
};

export type LastResult = {
  roundId: number;
  predictedNumber: number; // what the user bet on
  result: number; // dice value (-1 = missed round)
  winAmount: number; // 0 if lost
  amount: number; // original stake, for loss display
  status: 'WON' | 'LOST';
};

type PersistedState = {
  currentBet: Bet | null;
  lastResolvedRound: number | null;
  lastResult: LastResult | null;
};

function loadGame(key: string | null): PersistedState {
  if (!key)
    return { currentBet: null, lastResolvedRound: null, lastResult: null };
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {}
  return { currentBet: null, lastResolvedRound: null, lastResult: null };
}

function saveGame(key: string | null, state: PersistedState): void {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch {}
}

type Props = {
  live: LiveData | null;
  deduct: (amount: number) => boolean;
  credit: (amount: number) => void;
  userId: string | null;
};

export function useGameEngine({ live, deduct, credit, userId }: Props) {
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [lastResult, setLastResult] = useState<LastResult | null>(null);

  const currentBetRef = useRef<Bet | null>(null);
  const liveRef = useRef<LiveData | null>(null);
  const creditRef = useRef(credit);
  const deductRef = useRef(deduct);
  const prevRoundRef = useRef<number | null>(null);
  const resolvedRoundRef = useRef<number | null>(null);

  // Always reflects the current user's game key — read inside effects and placeBet
  const gameKeyRef = useRef<string | null>(null);
  gameKeyRef.current = userId ? gameKey(userId) : null;

  // Keep refs in sync with latest injected functions
  useEffect(() => {
    creditRef.current = credit;
  });
  useEffect(() => {
    deductRef.current = deduct;
  });
  useEffect(() => {
    liveRef.current = live;
  });

  // Reset all state and reload from the correct user's storage on user change
  useEffect(() => {
    currentBetRef.current = null;
    prevRoundRef.current = null;
    resolvedRoundRef.current = null;
    setCurrentBet(null);
    setLastResult(null);

    const key = userId ? gameKey(userId) : null;
    const state = loadGame(key);
    if (state.currentBet) {
      currentBetRef.current = state.currentBet;
      setCurrentBet(state.currentBet);
    }
    if (state.lastResolvedRound !== null) {
      resolvedRoundRef.current = state.lastResolvedRound;
    }
    if (state.lastResult) {
      setLastResult(state.lastResult);
    }
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Round resolution — fires when live.round changes
  useEffect(() => {
    if (live == null) return;

    const round = live.round;

    // First tick — record starting round, nothing to resolve yet
    if (prevRoundRef.current === null) {
      prevRoundRef.current = round;
      return;
    }

    // Same round — nothing to do
    if (round === prevRoundRef.current) return;

    const roundToResolve = prevRoundRef.current;
    prevRoundRef.current = round;

    // Double-resolution guard
    if (
      resolvedRoundRef.current !== null &&
      resolvedRoundRef.current >= roundToResolve
    )
      return;
    resolvedRoundRef.current = roundToResolve;

    const bet = currentBetRef.current;

    // CASE 3: bet belongs to the new round — leave it alone
    if (bet?.roundId === round) {
      const key = gameKeyRef.current;
      saveGame(key, { ...loadGame(key), lastResolvedRound: roundToResolve });
      return;
    }

    // No active bet — just mark round as resolved
    if (bet === null) {
      const key = gameKeyRef.current;
      saveGame(key, {
        ...loadGame(key),
        currentBet: null,
        lastResolvedRound: roundToResolve,
      });
      return;
    }

    // CASE 1: bet belongs to the round that just ended
    // CASE 2: bet is older (missed round) — conservative LOSS
    const diceResult =
      bet.roundId === roundToResolve ? live.previousResult : -1;
    const won = diceResult !== -1 && bet.number === diceResult;
    const winAmount = won ? Math.floor(bet.amount * MULTIPLIER) : 0;

    if (won) creditRef.current(winAmount);

    const result: LastResult = {
      roundId: roundToResolve,
      predictedNumber: bet.number,
      result: diceResult,
      winAmount,
      amount: bet.amount,
      status: won ? 'WON' : 'LOST',
    };

    setLastResult(result);
    currentBetRef.current = null;
    setCurrentBet(null);

    saveGame(gameKeyRef.current, {
      currentBet: null,
      lastResolvedRound: roundToResolve,
      lastResult: result,
    });
  }, [live?.round]); // eslint-disable-line react-hooks/exhaustive-deps
  // Intentionally only on round change — all other deps accessed via refs

  // placeBet — stable reference, reads live data via ref
  const placeBet = useCallback((number: number, amount: number): boolean => {
    const live = liveRef.current;
    if (!live) return false;

    // One bet per round
    if (currentBetRef.current?.roundId === live.round) return false;

    // Deduct from wallet — returns false if insufficient
    const ok = deductRef.current(amount);
    if (!ok) return false;

    const bet: Bet = { roundId: live.round, number, amount };
    currentBetRef.current = bet;
    setCurrentBet(bet);

    const key = gameKeyRef.current;
    saveGame(key, { ...loadGame(key), currentBet: bet });

    return true;
  }, []); // Stable forever — reads live data through refs

  return { currentBet, lastResult, placeBet };
}
