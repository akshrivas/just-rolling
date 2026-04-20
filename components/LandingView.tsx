'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  FaDiceOne,
  FaDiceTwo,
  FaDiceThree,
  FaDiceFour,
  FaDiceFive,
  FaDiceSix,
} from 'react-icons/fa';
import { auth } from '@/lib/firebase';
import { useGame } from '@/context/GameContext';

const DICE_MAP: Record<
  number,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  1: FaDiceOne,
  2: FaDiceTwo,
  3: FaDiceThree,
  4: FaDiceFour,
  5: FaDiceFive,
  6: FaDiceSix,
};

const RING_SIZE = 160;
const RING_RADIUS = 63;
const RING_STROKE = 2.5;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function LandingView() {
  const { live } = useGame();
  const [recentResults, setRecentResults] = useState<number[]>([]);
  const prevRoundRef = useRef<number | null>(null);
  const rollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // Stagger entrance
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!live) return;
    if (prevRoundRef.current === live.round) return;
    prevRoundRef.current = live.round;
    const r = live.previousResult;
    if (r >= 1 && r <= 6) {
      setRecentResults((prev) => [...prev.slice(-7), r]);
    }
  }, [live?.round, live?.previousResult]);

  useEffect(() => {
    if (!rollRef.current) return;
    rollRef.current.classList.remove('roll');
    void rollRef.current.offsetWidth;
    rollRef.current.classList.add('roll');
  }, [live?.previousResult]);

  const handleLogin = async () => {
    setLoginError(null);
    setLoginLoading(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? '';
      if (code === 'auth/popup-blocked') {
        setLoginError('Popup was blocked. Please allow popups for this site.');
      } else if (code === 'auth/popup-closed-by-user') {
        // user dismissed — not an error
      } else {
        setLoginError('Sign-in failed. Please try again.');
        console.error('[login]', err);
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const diceValue = live?.previousResult;
  const Dice =
    diceValue != null && diceValue >= 1 && diceValue <= 6
      ? DICE_MAP[diceValue]
      : null;

  const timeLeft = live?.timeLeft ?? 0;
  const roundDuration = live?.roundDuration ?? 30;
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / roundDuration);
  const ringColor =
    timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#f59e0b' : '#a855f7';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Deep purple radial glow — fixed behind everything */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-105 h-105 rounded-full bg-purple-700/18 blur-3xl" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-[#05060A] to-transparent pointer-events-none" />

      {/* ── Everything in one centered column, tightly spaced ── */}
      <div
        className={`relative flex flex-col items-center gap-0 w-full max-w-xs transition-all duration-700 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* LIVE badge */}
        <div
          className="flex items-center gap-1.5 mb-7"
          style={{ transitionDelay: '0ms' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold tracking-[0.18em] uppercase text-red-400">
            Live
          </span>
          {live?.round != null && (
            <span className="text-[10px] text-white/20 font-medium ml-1">
              · #{live.round}
            </span>
          )}
        </div>

        {/* Dice hero */}
        <div className="dice-float relative flex items-center justify-center mb-5">
          <div className="absolute w-36 h-36 rounded-full bg-purple-600/25 blur-2xl pointer-events-none" />
          <div
            className="relative"
            style={{ width: RING_SIZE, height: RING_SIZE }}
          >
            <svg
              width={RING_SIZE}
              height={RING_SIZE}
              className="absolute inset-0"
              style={{ transform: 'rotate(-90deg)' }}
            >
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.04)"
                strokeWidth={RING_STROKE}
              />
              {live && (
                <circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  fill="none"
                  stroke={ringColor}
                  strokeWidth={RING_STROKE}
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                  style={{
                    transition:
                      'stroke-dashoffset 0.9s linear, stroke 0.4s ease',
                  }}
                />
              )}
            </svg>
            <div
              ref={rollRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              {Dice ? (
                <Dice size={82} className="text-purple-400 dice-glow" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Recent results ticker — fixed height so layout doesn't jump */}
        <div className="relative w-full h-8 overflow-hidden mb-8">
          <div
            className="absolute left-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #05060A, transparent)' }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #05060A, transparent)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-3">
            {recentResults.length < 3
              ? /* Ghost placeholders so space is reserved */
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded bg-white/4 shrink-0"
                  />
                ))
              : recentResults.map((r, i) => {
                  const D = DICE_MAP[r];
                  const isLatest = i === recentResults.length - 1;
                  return (
                    <D
                      key={i}
                      size={isLatest ? 22 : 16}
                      className={`shrink-0 transition-all duration-300 ${
                        isLatest ? 'text-white/80' : 'text-white/18'
                      }`}
                    />
                  );
                })}
          </div>
        </div>

        {/* Headline */}
        <p
          className="text-white font-bold text-[28px] tracking-tight leading-tight text-center mb-2"
          style={{ transitionDelay: '80ms' }}
        >
          Pick a number. <span className="text-purple-400">Win 5.4×.</span>
        </p>

        {/* Sub-copy */}
        <p
          className="text-white/30 text-[13px] text-center mb-8 leading-relaxed"
          style={{ transitionDelay: '140ms' }}
        >
          New round every 30s
        </p>

        {/* CTA */}
        <div
          className="w-full flex flex-col gap-3"
          style={{ transitionDelay: '200ms' }}
        >
          <button
            onClick={handleLogin}
            disabled={loginLoading}
            className="landing-cta w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white font-semibold text-[15px] shadow-xl shadow-purple-900/50 transition-colors duration-150 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed"
          >
            {loginLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          {loginError && (
            <p className="text-center text-red-400 text-xs px-2">
              {loginError}
            </p>
          )}

          <p className="text-center text-white/25 text-xs">
            <span className="text-green-400/80">✓</span>&ensp;Free ₹10,000 to
            start
          </p>
        </div>
      </div>
    </div>
  );
}
