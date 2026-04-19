'use client';

type Props = {
  selected: number | null;
  onSelect: (n: number) => void;
};

export default function BetGrid({ selected, onSelect }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-10">
      {[1, 2, 3, 4, 5, 6].map((n) => {
        const isActive = selected === n;

        return (
          <button
            key={n}
            onClick={() => onSelect(n)}
            className={`
              h-20 rounded-xl flex items-center justify-center
              text-xl font-semibold
              transition-all duration-200 cursor-pointer
              
              ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                  : 'bg-[#12121A] text-white/80 hover:bg-[#1A1A22]'
              }
            `}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
