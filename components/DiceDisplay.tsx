'use client';

import React, { useEffect, useRef } from 'react';
import type { AccentName } from '@/context/GameContext';
import {
  FaDiceOne,
  FaDiceTwo,
  FaDiceThree,
  FaDiceFour,
  FaDiceFive,
  FaDiceSix,
} from 'react-icons/fa';

const map: Record<
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

const RING_HEX: Record<AccentName, string> = {
  purple: '#a855f7',
  amber:  '#f59e0b',
  red:    '#ef4444',
  green:  '#22c55e',
  zinc:   '#71717a',
};

const DICE_CLS: Record<AccentName, string> = {
  purple: 'text-purple-400',
  amber:  'text-amber-400',
  red:    'text-red-400',
  green:  'text-green-400',
  zinc:   'text-zinc-400',
};

const AMBIENT_CLS: Record<AccentName, string> = {
  purple: 'bg-purple-600/20',
  amber:  'bg-amber-500/15',
  red:    'bg-red-600/15',
  green:  'bg-green-600/20',
  zinc:   'bg-zinc-600/10',
};

type Props = {
  value: number;
  timeLeft: number;
  roundDuration: number;
  resultFlash?: 'win' | 'loss' | null;
  accent: AccentName;
};

export default function DiceDisplay({
  value,
  timeLeft,
  roundDuration,
  resultFlash,
  accent,
}: Props) {
  const rollRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  // Roll animation fires on every new value (new round)
  useEffect(() => {
    if (!rollRef.current) return;
    rollRef.current.classList.remove('roll');
    void rollRef.current.offsetWidth;
    rollRef.current.classList.add('roll');
  }, [value]);

  // Win / loss animation on the icon wrapper
  useEffect(() => {
    if (!iconRef.current) return;
    iconRef.current.classList.remove('dice-win', 'dice-loss');
    if (!resultFlash) return;
    void iconRef.current.offsetWidth;
    iconRef.current.classList.add(resultFlash === 'win' ? 'dice-win' : 'dice-loss');
  }, [resultFlash]);

  const Dice = map[value];

  // Guard: Only render if Dice is defined (value is 1-6)
  if (!Dice) return null;

  const RING_SIZE = 100;
  const RING_RADIUS = 38;
  const RING_STROKE = 2.5;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / roundDuration);
  const ringColor = RING_HEX[accent];
  const diceColorClass = DICE_CLS[accent];
  const ambientColorClass = AMBIENT_CLS[accent];

  return (
    <div className="w-full flex flex-col items-center py-0">
      <div className="dice-float relative flex flex-col items-center">
        {/* Ambient glow — color shifts with state */}
        <div
          className={`absolute inset-0 -m-6 blur-3xl rounded-full pointer-events-none transition-all duration-500 ${ambientColorClass}`}
        />

        {/* Ring + Dice container */}
        <div
          className="relative"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          {/* SVG circular countdown */}
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
          </svg>

          {/* Roll container — handles the spin/bounce animation */}
          <div
            ref={rollRef}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Icon wrapper — handles glow (win) or shake (loss) */}
            <div
              ref={iconRef}
              className={resultFlash ? '' : 'dice-glow'}
            >
              <Dice
                size={50}
                className={`transition-colors duration-500 ${diceColorClass}`}
              />
            </div>
          </div>
        </div>

        {/* Meta row: timer only */}
        <div
          className="flex justify-end items-center mt-1 px-1"
          style={{ width: RING_SIZE }}
        >
          <span
            className={`text-[10px] font-semibold ${
              timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white/20'
            }`}
          >
            {timeLeft}s
          </span>
        </div>
      </div>
    </div>
  );
}
