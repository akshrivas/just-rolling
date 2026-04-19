'use client';

import { FaWallet, FaCoins } from 'react-icons/fa';
import { useGame } from '@/context/GameContext';

export default function GameInfoBlock() {
  const { balance, currentBet, live } = useGame();

  // Only render when live data is ready (user is in a game session)
  if (!live) return null;

  return (
    <div className="w-full px-3 py-1 bg-[#05060A] border-b border-white/10">
      <div className="flex items-center justify-between max-w-md mx-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10">
        {/* Wallet */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-900/50 border border-purple-500/30">
            <FaWallet size={11} className="text-purple-400" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-white/45 uppercase tracking-widest font-medium">
              Wallet
            </span>
            <span className="text-sm font-bold text-purple-200 mt-0.5">
              ₹{balance.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-white/10" />

        {/* Current Bet */}
        <div className="flex items-center gap-1.5">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-lg border transition-colors duration-300 ${
              currentBet
                ? 'bg-amber-900/50 border-amber-500/30'
                : 'bg-zinc-800 border-white/10'
            }`}
          >
            <FaCoins
              size={11}
              className={`transition-colors duration-300 ${
                currentBet ? 'text-amber-400' : 'text-white/35'
              }`}
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[9px] text-white/45 uppercase tracking-widest font-medium">
              Current Bet
            </span>
            {currentBet ? (
              <span className="text-sm font-bold text-amber-300 mt-0.5">
                ₹{currentBet.amount.toLocaleString()}
              </span>
            ) : (
              <span className="text-sm font-semibold text-white/25 mt-0.5">
                —
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
