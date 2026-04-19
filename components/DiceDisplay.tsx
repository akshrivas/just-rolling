'use client';

import {
  FaDiceOne,
  FaDiceTwo,
  FaDiceThree,
  FaDiceFour,
  FaDiceFive,
  FaDiceSix,
} from 'react-icons/fa';
import { useEffect, useRef } from 'react';

const map = {
  1: FaDiceOne,
  2: FaDiceTwo,
  3: FaDiceThree,
  4: FaDiceFour,
  5: FaDiceFive,
  6: FaDiceSix,
};

export default function DiceDisplay({ value, previous, timeLeft }: any) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.classList.remove('roll');
    void ref.current.offsetWidth;
    ref.current.classList.add('roll');
  }, [value]);

  const Dice = map[value];
  const Prev = map[previous];

  return (
    <div className="flex flex-col items-center mt-10 relative">
      <div className="absolute w-64 h-64 bg-purple-500/10 blur-3xl rounded-full" />

      <div
        ref={ref}
        className="w-32 h-32 rounded-3xl bg-[#1A1A22] flex items-center justify-center shadow-xl"
      >
        <Dice size={52} className="text-purple-400" />
      </div>

      <div className="mt-4 flex items-center gap-2 opacity-60 text-sm">
        Previous <Prev size={16} />
      </div>

      <div
        className={`mt-2 text-xs ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white/50'}`}
      >
        ⏱ 00:{String(timeLeft).padStart(2, '0')}
      </div>
    </div>
  );
}
