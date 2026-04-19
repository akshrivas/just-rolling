'use client';

import React, { useEffect, useRef } from 'react';
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

type Props = {
  value: number;
  previous: number;
  timeLeft: number;
  roundDuration: number;
};

export default function DiceDisplay({ value, previous, timeLeft, roundDuration }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.classList.remove('roll');
    void ref.current.offsetWidth;
    ref.current.classList.add('roll');
  }, [value]);

  const Dice = map[value];
  const Prev = map[previous];

  // Guard: Only render if Dice is defined (value is 1-6)
  if (!Dice) return null;

  const RING_SIZE = 160;
  const RING_RADIUS = 62;
  const RING_STROKE = 2.5;
  const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  const dashOffset = CIRCUMFERENCE * (1 - timeLeft / roundDuration);
  const ringColor =
    timeLeft <= 3 ? '#ef4444' : timeLeft <= 5 ? '#fbbf24' : '#a855f7';

  return (
    <div className="w-full flex flex-col items-center py-2">
      <div className="dice-float relative flex flex-col items-center">
        {/* Ambient glow */}
        <div className="absolute inset-0 -m-8 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

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

          {/* Dice — centered */}
          <div
            ref={ref}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Dice size={80} className="text-purple-400 dice-glow" />
          </div>
        </div>

        {/* Meta row */}
        <div
          className="flex justify-between items-center mt-2 px-1"
          style={{ width: RING_SIZE }}
        >
          {Prev ? (
            <span className="flex items-center gap-1 text-[10px] text-white/25">
              Prev: <Prev size={10} />
            </span>
          ) : (
            <span />
          )}
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
