'use client';

import { useEffect, useRef } from 'react';
import { useGame } from '@/context/GameContext';

export default function ChatFeed() {
  const { chatMessages } = useGame();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="flex flex-col gap-1 overflow-y-auto px-2 pb-1 w-full">
      {chatMessages.length === 0 ? (
        <div className="flex items-end gap-2 chat-msg-in">
          <HostAvatar />
          <div className="bg-zinc-900 border border-white/5 text-white/45 text-xs px-2.5 py-1.5 rounded-xl rounded-bl-sm italic">
            Place your bet 🎯
          </div>
        </div>
      ) : (
        chatMessages.map((msg) => {
          // Structured result bubble
          if (msg.resultPayload) {
            const { predicted, actual, status } = msg.resultPayload;
            const hit = status === 'WON';
            return (
              <div key={msg.id} className="flex items-end gap-2 chat-msg-in">
                <HostAvatar />
                <div
                  className={`text-xs px-2.5 py-1.5 rounded-xl rounded-bl-sm border leading-relaxed ${
                    hit
                      ? 'bg-green-950 border-green-500/25'
                      : 'bg-zinc-900 border-white/5'
                  }`}
                >
                  <div className="text-white/45">
                    Predicted →{' '}
                    <span className="text-white font-semibold">
                      {predicted}
                    </span>
                  </div>
                  <div className="text-white/45">
                    Actual →{' '}
                    <span className="text-white font-bold">{actual}</span>
                  </div>
                  <div
                    className={`font-bold mt-0.5 ${
                      hit ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {hit ? '🔥 Hit!' : '❌ Miss'}
                  </div>
                </div>
              </div>
            );
          }

          // System text bubble
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex items-end gap-2 chat-msg-in">
                <HostAvatar />
                <div className="bg-zinc-900 border border-white/5 text-white/80 text-xs px-2.5 py-1.5 rounded-xl rounded-bl-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          // User bubble
          return (
            <div key={msg.id} className="flex justify-end chat-msg-in">
              <div className="bg-purple-700 text-white text-xs px-2.5 py-1.5 rounded-xl rounded-br-sm max-w-[70%]">
                {msg.text}
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}

function HostAvatar() {
  return (
    <div className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/30 flex items-center justify-center shrink-0 text-[9px]">
      🎲
    </div>
  );
}
