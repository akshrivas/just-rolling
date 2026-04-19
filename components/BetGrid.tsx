'use client';

import type { AccentName } from '@/context/GameContext';

const TILE_ACTIVE_CLS: Record<AccentName, string> = {
  purple:
    'bg-purple-600 shadow-lg shadow-purple-500/50 scale-[1.05] ring-1 ring-purple-400/40',
  amber:
    'bg-amber-600  shadow-lg shadow-amber-500/40  scale-[1.05] ring-1 ring-amber-400/40',
  red: 'bg-red-600    shadow-lg shadow-red-500/40    scale-[1.05] ring-1 ring-red-400/40',
  green:
    'bg-green-600  shadow-lg shadow-green-500/40  scale-[1.05] ring-1 ring-green-400/40',
  zinc: 'bg-zinc-700   shadow-lg shadow-zinc-500/30   scale-[1.05] ring-1 ring-zinc-500/30',
};

type Props = {
  selected: number | null;
  onSelect: (n: number) => void;
  disabled?: boolean;
  betActive?: boolean;
  accent: AccentName;
};

export default function BetGrid({
  selected,
  onSelect,
  disabled,
  betActive,
  accent,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-full">
      {[1, 2, 3, 4, 5, 6].map((n) => {
        const isActive = selected === n;
        // When bet is active: keep selected tile bright, dim others hard
        const dimClass = disabled
          ? betActive
            ? isActive
              ? ''
              : 'opacity-20'
            : 'opacity-40'
          : '';
        const cursorClass = disabled
          ? betActive && isActive
            ? 'cursor-default'
            : 'cursor-not-allowed'
          : 'cursor-pointer';
        return (
          <button
            key={n}
            onClick={() => !disabled && onSelect(n)}
            disabled={disabled}
            className={`
              h-9 rounded-xl flex flex-col items-center justify-center gap-0.5
              transition-all duration-150 select-none
              ${dimClass} ${cursorClass}
              ${
                isActive
                  ? `text-white ${TILE_ACTIVE_CLS[accent]}`
                  : 'bg-zinc-900 text-white/85 hover:bg-zinc-800 hover:text-white hover:scale-[1.03] hover:ring-1 hover:ring-white/10'
              }
            `}
          >
            <span className="text-base font-bold leading-none">{n}</span>
            <span
              className={`text-[9px] font-medium leading-none ${
                isActive ? 'text-white/60' : 'text-white/40'
              }`}
            >
              5.4×
            </span>
          </button>
        );
      })}
    </div>
  );
}
