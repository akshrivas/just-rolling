'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
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

const DICE_MAP: Record<number, React.ComponentType<{ size?: number; className?: string }>> = {
  1: FaDiceOne,
  2: FaDiceTwo,
  3: FaDiceThree,
  4: FaDiceFour,
  5: FaDiceFive,
  6: FaDiceSix,
};

function roundsToday(): string {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return Math.floor((Date.now() - startOfDay.getTime()) / 30_000).toLocaleString();
}

const RING_SIZE = 148;
const RING_RADIUS = 58;
const RING_STROKE = 3;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function LandingView() {
  const { live } = useGame();
  const [recentResults, setRecentResults] = useState<number[]>([]);
  const prevRoundRef = useRef<number | null>(null);
  const rollRef = useRef<HTMLDivElement>(null);

  // Append dice result on every new round
  useEffect(() => {
    if (!live) return;
    if (prevRoundRef.current === live.round) return;
    prevRoundRef.current = live.round;
    const r = live.previousResult;
    if (r >= 1 && r <= 6) {
      setRecentResults((prev) => [...prev.slice(-9), r]);
    }
  }, [live?.round, live?.previousResult]);

  // Roll animation on dice value change
  useEffect(() => {
    if (!rollRef.current) return;
    rollRef.current.classList.remove('roll');
    void rollRef.current.offsetWidth;
    rollRef.current.classList.add('roll');
  }, [live?.previousResult]);

  const handleLogin = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const diceValue = live?.previousResult;
  const Dice = diceValue != null && diceValue >= 1 && diceValue <= 6 ? DICE_MAP[diceValue] : null;

  const timeLeft = live?.timeLeft ?? 0;
  const roundDuration = live?.roundDuration ?? 30;
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / roundDuration);
  const ringColor = timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#f59e0b' : '#a855f7';

  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-2 pb-8 overflow-hidden">

      {/* ── Hero: live dice ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-xs">

        {/* LIVE badge + round */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
            Live
          </span>
          {live?.round != null && (
            <span className="text-[10px] text-white/30 font-medium">
              · Round #{live.round}
            </span>
          )}
        </div>

        {/* Dice — large hero */}
        <div className="dice-float relative flex items-center justify-center">
          {/* ambient glow */}
          <div className="absolute inset-0 -m-10 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
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
                stroke="rgba(255,255,255,0.05)"
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
                />
              )}
            </svg>

            <div
              ref={rollRef}
              className="absolute inset-0 flex items-center justify-center"
            >
              {Dice ? (
                <Dice size={76} className="text-purple-400 dice-glow" />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-zinc-800 animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Recent results ticker */}
        {recentResults.length > 0 && (
          <div className="relative w-full overflow-hidden">
            {/* fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-[#05060A] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-linear-to-l from-[#05060A] to-transparent z-10 pointer-events-none" />
            <div className="flex items-center justify-center gap-2.5 px-8">
              {recentResults.map((r, i) => {
                const D = DICE_MAP[r];
                const isLatest = i === recentResults.length - 1;
                return (
                  <D
                    key={i}
                    size={isLatest ? 24 : 18}
                    className={`shrink-0 transition-all duration-300 ${
                      isLatest ? 'text-white/90' : 'text-white/22'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Bottom CTA ── */}
      <div className="w-full max-w-xs flex flex-col gap-4">
        <div className="text-center">
          <p className="text-white font-bold text-2xl tracking-tight leading-tight">
            Pick a number.<br />Win 5.4×.
          </p>
          <p className="text-white/35 text-xs mt-2 leading-relaxed">
            New round every 30s &nbsp;·&nbsp; {roundsToday()} rounds today
          </p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full py-3.5 rounded-2xl bg-linear-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white font-semibold text-sm shadow-lg shadow-purple-700/40 transition-all duration-150 cursor-pointer active:scale-[0.98]"
        >
          Continue with Google
        </button>

        <p className="text-center text-white/30 text-xs">
          <span className="text-green-400 font-semibold">✓</span> Free ₹10,000 to start
        </p>
      </div>
    </div>
  );
}
