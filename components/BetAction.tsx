'use client';

import type { LastResult } from '@/hooks/useGameEngine';

type Props = {
  selectedNumber: number | null;
  selectedAmount: number;
  onBet: () => void;
  betPlaced: boolean;
  lastResult: LastResult | null;
};

export default function BetAction({
  selectedNumber,
  selectedAmount,
  onBet,
  betPlaced,
  lastResult,
}: Props) {
  const isValid = selectedNumber !== null && !betPlaced;
  const win = Math.floor(selectedAmount * 5.4);

  // Determine what to show in the preview row
  const showLastResult =
    lastResult !== null && !betPlaced && selectedNumber === null;

  return (
    <div className="mt-2">
      {/* Preview row */}
      <div className="flex items-center justify-between text-xs px-1 mb-2 h-4">
        {betPlaced ? (
          <span className="w-full text-center text-green-400 text-xs font-semibold tracking-wide">
            Bet placed — waiting for roll
          </span>
        ) : showLastResult ? (
          lastResult.status === 'WON' ? (
            <span className="w-full text-center text-green-400 text-[11px] font-semibold tracking-wide">
              You won ₹{lastResult.winAmount.toLocaleString()} 🎉
            </span>
          ) : (
            <span className="w-full text-center text-red-400 text-xs font-medium tracking-wide">
              You lost ₹{lastResult.amount.toLocaleString()}
            </span>
          )
        ) : selectedNumber !== null ? (
          <>
            <span className="text-white/70">
              ₹{selectedAmount} on{' '}
              <span className="text-white font-semibold">
                {selectedNumber}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="text-white/50 text-[10px] font-normal">
                5.4×
              </span>
              Win ₹{win.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-white/50 w-full text-center text-xs">
            Pick a number to place your bet
          </span>
        )}
      </div>

      {/* CTA */}
      {betPlaced ? (
        <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-green-400 bg-green-500/10 border border-green-500/20">
          ✓ Bet Placed
        </div>
      ) : (
        <button
          onClick={onBet}
          disabled={!isValid}
          className={`
            w-full py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-150
            ${
              isValid
                ? 'bg-linear-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30 cursor-pointer active:scale-[0.98]'
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
