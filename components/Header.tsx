'use client';

import { useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';

type CurrentBet = {
  amount: number;
  number: number;
} | null;

export default function Header({ currentBet }: { currentBet?: CurrentBet }) {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const { balance } = useGame();

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogin = async () => {
    await signInWithPopup(auth, new GoogleAuthProvider());
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOpen(false);
  };

  const rawPhoto = user?.photoURL || user?.providerData?.[0]?.photoURL || null;

  const photo = rawPhoto ? rawPhoto.replace('s96-c', 's256-c') : null;

  return (
    <header className="w-full h-14 px-4 sm:px-8 flex items-center justify-between gap-4 bg-[#05060A] border-b border-white/10">
      {/* LEFT */}
      <div className="shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full" />
        <span className="text-white font-semibold tracking-wide text-base whitespace-nowrap">
          Just Rolling
        </span>
      </div>

      {/* CENTER — GREETING */}
      {user && (
        <div className="flex-1 flex justify-center min-w-0">
          <span className="text-sm text-white/60 truncate">
            👋 Hey {user.displayName?.split(' ')[0]}
          </span>
        </div>
      )}

      {/* RIGHT */}
      <div ref={ref} className="shrink-0 flex items-center gap-3 relative">
        {/* Balance */}
        {user && (
          <div className="text-sm text-purple-400 font-semibold tracking-wide">
            ₹{balance.toLocaleString()}
          </div>
        )}

        {/* Avatar + Dropdown */}
        {user ? (
          <>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-[#111] border border-white/10 flex items-center justify-center">
                {photo && (
                  <Image
                    src={photo}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                  />
                )}
              </div>

              <span className="text-white/40 text-xs">▼</span>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#0B0C10] border border-white/10 rounded-xl shadow-xl p-2 z-50">
                <div className="px-3 py-2 text-sm text-white truncate">
                  {user.displayName}
                </div>

                <div className="h-px bg-white/10 my-2" />

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={handleLogin}
            className="px-5 py-2 text-sm rounded-full bg-purple-600 hover:bg-purple-500 text-white transition cursor-pointer active:scale-95"
          >
            Login with Google
          </button>
        )}
      </div>
    </header>
  );
}
