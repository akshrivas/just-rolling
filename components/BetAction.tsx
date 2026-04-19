'use client';

type Props = {
  selectedNumber: number | null;
  selectedAmount: number;
  onBet: () => void;
};

export default function BetAction({
  selectedNumber,
  selectedAmount,
  onBet,
}: Props) {
  const isValid = selectedNumber !== null;

  const win = selectedAmount * 5.4;

  return (
    <div className="mt-10 text-center">
      {/* Preview */}
      {isValid ? (
        <>
          <div className="text-sm text-white/70">
            Selected: ₹{selectedAmount} on {selectedNumber}
          </div>

          <div className="text-sm text-purple-400 mt-1">
            Win: ₹{Math.floor(win)}
          </div>
        </>
      ) : (
        <div className="text-sm text-white/40">
          Select a number to place bet
        </div>
      )}

      {/* CTA */}
      <button
        onClick={onBet}
        disabled={!isValid}
        className={`
          mt-5 px-8 py-3 rounded-xl text-sm font-semibold
          transition-all duration-200

          ${
            isValid
              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 cursor-pointer active:scale-95'
              : 'bg-[#12121A] text-white/30 cursor-not-allowed'
          }
        `}
      >
        Place Bet
      </button>
    </div>
  );
}
