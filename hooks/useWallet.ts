'use client';

import { useEffect, useState } from 'react';

const INITIAL_BALANCE = 10_000;

function walletKey(userId: string) {
  return `jr_wallet_${userId}`;
}

export function useWallet(userId: string | null) {
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  // Reload from correct user's storage whenever userId changes (handles login/logout/switch)
  useEffect(() => {
    if (!userId) {
      setBalance(INITIAL_BALANCE);
      return;
    }
    const stored = localStorage.getItem(walletKey(userId));
    if (stored !== null) {
      const n = Number(stored);
      if (Number.isFinite(n) && n >= 0) {
        setBalance(n);
        return;
      }
    }
    setBalance(INITIAL_BALANCE);
  }, [userId]);

  const persist = (n: number) => {
    if (userId) localStorage.setItem(walletKey(userId), String(n));
  };

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
