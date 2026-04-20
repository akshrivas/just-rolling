'use client';

import type { AccentName } from '@/context/GameContext';

const AMOUNTS = [100, 200, 500, 1000];

const PILL_CLS: Record<AccentName, string> = {
  purple:
    'bg-purple-600 shadow-md shadow-purple-500/40 ring-1 ring-purple-400/30',
  amber:
    'bg-amber-600  shadow-md shadow-amber-500/40  ring-1 ring-amber-400/30',
  red: 'bg-red-700    shadow-md shadow-red-500/30    ring-1 ring-red-400/30',
  green:
    'bg-green-600  shadow-md shadow-green-500/40  ring-1 ring-green-400/30',
  zinc: 'bg-zinc-700   ring-1 ring-zinc-500/30',
};

type Props = {
  selected: number;
  onSelect: (amt: number) => void;
  disabled?: boolean;
  accent: AccentName;
};

export default function AmountSelector({
  selected,
  onSelect,
  disabled,
  accent,
}: Props) {
  return (
    <div className="flex gap-1.5 mt-1.5 w-full">
      {AMOUNTS.map((amt) => {
        const active = selected === amt;

        return (
          <button
            key={amt}
            onClick={() => !disabled && onSelect(amt)}
            disabled={disabled}
            className={`
              flex-1 py-1 rounded-full text-xs font-medium
              transition-all duration-150 select-none
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${
                active
                  ? `${PILL_CLS[accent]} text-white`
                  : 'bg-zinc-900 text-white/70 hover:text-white hover:bg-zinc-800 hover:ring-1 hover:ring-white/15'
              }
            `}
          >
            {amt.toLocaleString()}
          </button>
        );
      })}
    </div>
  );
}
