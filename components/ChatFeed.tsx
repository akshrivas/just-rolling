'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useGame } from '@/context/GameContext';

export default function ChatFeed() {
  const { chatMessages, userPhotoUrl } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  if (chatMessages.length === 0) {
    return (
      <div className="flex items-end pb-1 px-1">
        <div className="flex items-end gap-2">
          <div className="w-6 h-6 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center shrink-0 text-[11px]">
            🎲
          </div>
          <div className="bg-zinc-800 text-white/50 text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm italic">
            Pick a number and place your bet…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 overflow-y-auto px-1 pb-1 w-full">
      {chatMessages.map((msg) =>
        msg.sender === 'system' ? (
          <div key={msg.id} className="flex items-end gap-2 chat-msg-in">
            {/* Host avatar */}
            <div className="w-6 h-6 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center shrink-0 text-[11px]">
              🎲
            </div>
            <div className="bg-zinc-800 text-white/90 text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm max-w-[78%] leading-snug">
              {msg.text}
            </div>
          </div>
        ) : (
          <div key={msg.id} className="flex items-end gap-2 justify-end chat-msg-in">
            <div className="bg-purple-700 text-white text-sm px-3 py-1.5 rounded-2xl rounded-br-sm max-w-[78%] leading-snug">
              {msg.text}
            </div>
            {/* User avatar */}
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-700 border border-white/10 shrink-0 flex items-center justify-center">
              {userPhotoUrl ? (
                <Image
                  src={userPhotoUrl}
                  alt="you"
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-[10px] text-white/60 font-semibold">U</span>
              )}
            </div>
          </div>
        ),
      )}
      <div ref={bottomRef} />
    </div>
  );
}
