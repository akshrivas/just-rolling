'use client';

type Props = {
  selected: number | null;
  onSelect: (n: number) => void;
  disabled?: boolean;
};

export default function BetGrid({ selected, onSelect, disabled }: Props) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full">
      {[1, 2, 3, 4, 5, 6].map((n) => {
        const isActive = selected === n;

        return (
          <button
            key={n}
            onClick={() => !disabled && onSelect(n)}
            disabled={disabled}
            className={`
              h-14 rounded-xl flex flex-col items-center justify-center gap-0.5
              transition-all duration-150 select-none
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-[1.05] ring-1 ring-purple-400/40'
                  : 'bg-[#12121A] text-white/70 hover:bg-[#1A1A26] hover:text-white hover:scale-[1.03] hover:ring-1 hover:ring-purple-500/20 hover:shadow-md hover:shadow-purple-500/10'
              }
            `}
          >
            <span className="text-base font-bold leading-none">{n}</span>
            <span
              className={`text-[9px] font-medium leading-none ${
                isActive ? 'text-white/50' : 'text-white/20'
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
