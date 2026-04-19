'use client';

import type { AccentName } from '@/context/GameContext';

const BTN_CLS: Record<AccentName, string> = {
  purple: 'bg-linear-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 shadow-lg shadow-purple-600/30',
  amber:  'bg-linear-to-r from-amber-700  to-amber-500  hover:from-amber-600  hover:to-amber-400  shadow-lg shadow-amber-600/30',
  red:    'bg-linear-to-r from-red-700    to-red-500    hover:from-red-600    hover:to-red-400    shadow-lg shadow-red-600/30',
  green:  'bg-linear-to-r from-green-700  to-green-500  hover:from-green-600  hover:to-green-400  shadow-lg shadow-green-600/30',
  zinc:   'bg-linear-to-r from-zinc-700   to-zinc-600   shadow-lg shadow-zinc-600/20',
};

const PREVIEW_CLS: Record<AccentName, string> = {
  purple: 'text-purple-400',
  amber:  'text-amber-400',
  red:    'text-red-400',
  green:  'text-green-400',
  zinc:   'text-zinc-400',
};

const PLACED_CLS: Record<AccentName, string> = {
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  amber:  'text-amber-400  bg-amber-500/10  border-amber-500/20',
  red:    'text-red-400    bg-red-500/10    border-red-500/20',
  green:  'text-green-400  bg-green-500/10  border-green-500/20',
  zinc:   'text-zinc-400   bg-zinc-500/10   border-zinc-500/20',
};

type Props = {
  selectedNumber: number | null;
  selectedAmount: number;
  onBet: () => void;
  betPlaced: boolean;
  bettingLocked: boolean;
  accent: AccentName;
};

export default function BetAction({
  selectedNumber,
  selectedAmount,
  onBet,
  betPlaced,
  bettingLocked,
  accent,
}: Props) {
  const isValid = selectedNumber !== null && !betPlaced && !bettingLocked;
  const win = Math.floor(selectedAmount * 5.4);

  return (
    <div className="mt-1.5">
      {/* Preview row — only shows bet details when a number is selected */}
      <div className="flex items-center justify-between text-xs px-1 mb-1.5 h-4">
        {selectedNumber !== null && !betPlaced ? (
          <>
            <span className="text-white/70">
              ₹{selectedAmount} on{' '}
              <span className="text-white font-semibold">{selectedNumber}</span>
            </span>
            <span className={`flex items-center gap-1.5 font-semibold ${PREVIEW_CLS[accent]}`}>
              <span className="text-white/50 text-[10px] font-normal">
                5.4×
              </span>
              Win ₹{win.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-white/50 w-full text-center text-xs">
            {betPlaced
              ? 'Waiting for roll…'
              : bettingLocked
              ? 'Bets closed for this round'
              : 'Pick a number to place your bet'}
          </span>
        )}
      </div>

      {/* CTA */}
      {betPlaced ? (
        <div className={`w-full py-2 rounded-xl text-sm font-semibold text-center border ${PLACED_CLS[accent]}`}>
          ✓ Bet Placed
        </div>
      ) : (
        <button
          onClick={onBet}
          disabled={!isValid}
          className={`
            w-full py-2 rounded-xl text-sm font-semibold
            transition-all duration-150
            ${
              isValid
                ? `${BTN_CLS[accent]} text-white cursor-pointer active:scale-[0.98]`
                : 'bg-zinc-800 text-white/30 border border-white/5 cursor-not-allowed'
            }
          `}
        >
          Place Bet
        </button>
      )}
    </div>
  );
}
