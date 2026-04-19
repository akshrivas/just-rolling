'use client';

const AMOUNTS = [100, 200, 500, 1000];

type Props = {
  selected: number;
  onSelect: (amt: number) => void;
};

export default function AmountSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex justify-center gap-3 mt-8">
      {AMOUNTS.map((amt) => {
        const active = selected === amt;

        return (
          <button
            key={amt}
            onClick={() => onSelect(amt)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200 cursor-pointer

              ${
                active
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'bg-[#12121A] text-white/70 hover:bg-[#1A1A22]'
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
