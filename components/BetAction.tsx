'use client';

type Props = {
  selectedNumber: number | null;
  selectedAmount: number;
  onBet: () => void;
  betPlaced: boolean;
};

export default function BetAction({
  selectedNumber,
  selectedAmount,
  onBet,
  betPlaced,
}: Props) {
  const isValid = selectedNumber !== null && !betPlaced;
  const win = Math.floor(selectedAmount * 5.4);

  return (
    <div className="mt-4">
      {/* Preview row */}
      <div className="flex items-center justify-between text-xs px-1 mb-3 h-4">
        {betPlaced ? (
          <span className="w-full text-center text-green-400/70 text-[11px] tracking-wide">
            Bet placed — waiting for roll
          </span>
        ) : selectedNumber !== null ? (
          <>
            <span className="text-white/40">
              ₹{selectedAmount} on{' '}
              <span className="text-white/70 font-semibold">
                {selectedNumber}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <span className="text-white/20 text-[10px] font-normal">
                5.4×
              </span>
              Win ₹{win.toLocaleString()}
            </span>
          </>
        ) : (
          <span className="text-white/20 w-full text-center text-[11px]">
            Pick a number to place your bet
          </span>
        )}
      </div>

      {/* CTA */}
      {betPlaced ? (
        <div className="w-full py-3 rounded-xl text-sm font-semibold text-center text-green-400 bg-green-500/10 border border-green-500/20">
          ✓ Bet Placed
        </div>
      ) : (
        <button
          onClick={onBet}
          disabled={!isValid}
          className={`
            w-full py-3 rounded-xl text-sm font-semibold
            transition-all duration-150
            ${
              isValid
                ? 'bg-linear-to-r from-purple-700 to-purple-500 hover:from-purple-600 hover:to-purple-400 text-white shadow-lg shadow-purple-600/30 cursor-pointer active:scale-[0.98]'
                : 'bg-linear-to-r from-purple-900/20 to-purple-800/10 text-purple-400/25 border border-purple-500/10 cursor-not-allowed'
            }
          `}
        >
          Place Bet
        </button>
      )}
    </div>
  );
}
