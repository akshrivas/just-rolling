'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import { FaDiceSix } from 'react-icons/fa';
import { auth } from '@/lib/firebase';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';

const DICE_CLS: Record<string, string> = {
  purple: 'text-purple-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  green: 'text-green-400',
  zinc: 'text-zinc-500',
};

export default function Header() {
  // All auth state comes from context — no direct auth.currentUser reads
  const { accent, isLoggedIn, authLoading, user, userPhotoUrl } = useGame();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // While Firebase is resolving the auth state, render nothing to prevent flicker
  if (authLoading) return null;

  // Logged-out: no header — landing view is full-bleed
  if (!isLoggedIn) return null;

  const handleLogout = async () => {
    console.log('[logout] signing out');
    setOpen(false);
    try {
      await signOut(auth);
      // isLoggedIn will become false via onAuthStateChanged → context update
    } catch (err) {
      console.error('[logout]', err);
    }
  };

  // Derive display values from reactive context state only
  const displayName = user?.displayName ?? null;
  const photo = userPhotoUrl ?? user?.photoURL ?? null;
  const diceColor = DICE_CLS[accent] ?? 'text-purple-400';

  return (
    <header className="relative z-50 w-full h-11 px-4 sm:px-6 flex items-center justify-between bg-[#05060A]/90 backdrop-blur-sm border-b border-white/5">
      {/* Logo mark */}
      <div className="flex items-center gap-1">
        <FaDiceSix
          size={18}
          className={`transition-colors duration-500 ${diceColor}`}
        />
        <span
          className={`text-xl font-extralight leading-none pb-0.5 transition-colors duration-500 ${diceColor}`}
        >
          ∞
        </span>
      </div>

      {/* Avatar + dropdown */}
      <div ref={ref} className="shrink-0 flex items-center relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-900 border border-white/10 flex items-center justify-center">
            {photo && (
              <Image
                src={photo}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full object-cover"
              />
            )}
          </div>
          <span className="text-white/25 text-[10px]">▼</span>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#0B0C10] border border-white/8 rounded-2xl shadow-2xl shadow-black/60 p-2 z-50">
            {displayName && (
              <div className="px-3 py-2 text-sm text-white/70 truncate">
                {displayName}
              </div>
            )}
            <div className="h-px bg-white/8 my-1" />
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm rounded-xl text-white/50 hover:bg-white/6 hover:text-white/90 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
