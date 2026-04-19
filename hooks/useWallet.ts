'use client';

import { useEffect, useState } from 'react';

const WALLET_KEY = 'jr_wallet';
const INITIAL_BALANCE = 10_000;

export function useWallet() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  // Restore from localStorage on mount (client-only)
  useEffect(() => {
    const stored = localStorage.getItem(WALLET_KEY);
    if (stored !== null) {
      const n = Number(stored);
      if (Number.isFinite(n) && n >= 0) setBalance(n);
    }
  }, []);

  const persist = (n: number) => localStorage.setItem(WALLET_KEY, String(n));

  /** Returns false if balance is insufficient — does NOT mutate state. */
  const deduct = (amount: number): boolean => {
    // `balance` here is the value from the last render, which is always
    // current when called from a user event handler (button click).
    if (balance < amount) return false;
    const next = balance - amount;
    setBalance(next);
    persist(next);
    return true;
  };

  const credit = (amount: number): void => {
    const next = balance + amount;
    setBalance(next);
    persist(next);
  };

  return { balance, deduct, credit };
}
