'use client';

const AMOUNTS = [100, 200, 500, 1000];

type Props = {
  selected: number;
  onSelect: (amt: number) => void;
  disabled?: boolean;
};

export default function AmountSelector({
  selected,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="flex gap-2 mt-3 w-full">
      {AMOUNTS.map((amt) => {
        const active = selected === amt;

        return (
          <button
            key={amt}
            onClick={() => !disabled && onSelect(amt)}
            disabled={disabled}
            className={`
              flex-1 py-2 rounded-full text-sm font-medium
              transition-all duration-150 select-none
              ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              ${
                active
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/40 ring-1 ring-purple-400/30'
                  : 'bg-[#12121A] text-white/50 hover:text-white hover:bg-[#1A1A26] hover:ring-1 hover:ring-white/10'
              }
            `}
          >
            ₹{amt}
          </button>
        );
      })}
    </div>
  );
}
