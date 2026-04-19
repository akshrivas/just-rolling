'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LiveData } from './useLive';

const BET_KEY = 'jr_bet';
const RESOLVED_KEY = 'jr_resolved';
const HISTORY_KEY = 'jr_history';

const MULTIPLIER = 5.4;

export type BetStatus = 'PLACED' | 'WON' | 'LOST';

export type Bet = {
  roundId: number;
  number: number;
  amount: number;
  status: BetStatus;
};

export type RoundResult = {
  roundId: number;
  /** -1 means the round was missed (lost connectivity for >10s) */
  diceResult: number;
  bet: Bet;
  payout: number;
};

type Props = {
  live: LiveData | null;
  /** Injected from useWallet — deduct returns false if insufficient */
  deduct: (amount: number) => boolean;
  credit: (amount: number) => void;
};

export function useGameEngine({ live, deduct, credit }: Props) {
  const [currentBet, setCurrentBet] = useState<Bet | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [history, setHistory] = useState<RoundResult[]>([]);

  // ------------------------------------------------------------------
  // Refs: give effects stable access to latest values without stale closures
  // ------------------------------------------------------------------
  const currentBetRef = useRef<Bet | null>(null);
  const liveRef = useRef<LiveData | null>(null);
  const creditRef = useRef(credit);
  const deductRef = useRef(deduct);
  const prevRoundRef = useRef<number | null>(null);
  const resolvedRoundRef = useRef<number>(-1);

  // Keep refs in sync — these run after every render, always before effects
  // that depend on the same render's values.
  useEffect(() => {
    creditRef.current = credit;
  });
  useEffect(() => {
    deductRef.current = deduct;
  });
  useEffect(() => {
    liveRef.current = live;
  });

  // ------------------------------------------------------------------
  // Restore persisted state on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    try {
      const rawBet = localStorage.getItem(BET_KEY);
      if (rawBet) {
        const bet: Bet = JSON.parse(rawBet);
        currentBetRef.current = bet;
        setCurrentBet(bet);
      }
      const rawResolved = localStorage.getItem(RESOLVED_KEY);
      if (rawResolved) {
        const n = Number(rawResolved);
        if (Number.isFinite(n)) resolvedRoundRef.current = n;
      }
      const rawHistory = localStorage.getItem(HISTORY_KEY);
      if (rawHistory) setHistory(JSON.parse(rawHistory));
    } catch {
      // Corrupt localStorage — ignore and start fresh
    }
  }, []);

  // ------------------------------------------------------------------
  // Round resolution: fires when live.round changes
  // ------------------------------------------------------------------
  useEffect(() => {
    if (live == null) return;

    const round = live.round;

    // First tick — just record the starting round, nothing to resolve yet
    if (prevRoundRef.current === null) {
      prevRoundRef.current = round;
      return;
    }

    // Same round — nothing to do
    if (round === prevRoundRef.current) return;

    const justEnded = prevRoundRef.current;
    prevRoundRef.current = round;

    // Double-resolution guard: never pay out the same round twice
    if (resolvedRoundRef.current >= justEnded) return;
    resolvedRoundRef.current = justEnded;
    localStorage.setItem(RESOLVED_KEY, String(justEnded));

    // No bet placed this round — nothing to resolve
    const bet = currentBetRef.current;
    if (!bet) return;

    // Determine outcome
    // Normal: bet.roundId === justEnded → resolve against live.previousResult
    // Missed: bet.roundId < justEnded → lost connectivity, conservative loss
    let diceResult: number;
    let won: boolean;

    if (bet.roundId === justEnded) {
      // live.previousResult is the result of the round that just ended
      diceResult = live.previousResult;
      won = bet.number === diceResult;
    } else {
      // Missed round — cannot recover the result
      diceResult = -1;
      won = false;
    }

    const payout = won ? Math.floor(bet.amount * MULTIPLIER) : 0;
    if (won) creditRef.current(payout);

    const resolvedBet: Bet = { ...bet, status: won ? 'WON' : 'LOST' };
    const result: RoundResult = { roundId: justEnded, diceResult, bet: resolvedBet, payout };

    setLastResult(result);
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, 20);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    // Clear the active bet
    currentBetRef.current = null;
    setCurrentBet(null);
    localStorage.removeItem(BET_KEY);
  }, [live?.round]); // eslint-disable-line react-hooks/exhaustive-deps
  // ^ Intentionally only on round change. All other deps accessed via refs.

  // ------------------------------------------------------------------
  // placeBet — stable reference (empty deps, all state via refs)
  // ------------------------------------------------------------------
  const placeBet = useCallback((number: number, amount: number): boolean => {
    const live = liveRef.current;
    if (!live) return false;

    // One bet per round
    if (currentBetRef.current?.roundId === live.round) return false;

    // Deduct from wallet — returns false if insufficient
    const ok = deductRef.current(amount);
    if (!ok) return false;

    const bet: Bet = { roundId: live.round, number, amount, status: 'PLACED' };
    currentBetRef.current = bet;
    setCurrentBet(bet);
    localStorage.setItem(BET_KEY, JSON.stringify(bet));

    return true;
  }, []); // Stable forever — reads live data through refs

  return { currentBet, lastResult, history, placeBet };
}
