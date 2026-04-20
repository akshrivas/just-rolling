'use client';

import { useGame } from '@/context/GameContext';
import type { MessageType } from '@/context/GameContext';

const styles: Record<MessageType, { bar: string; text: string }> = {
  info: {
    bar: 'bg-zinc-900 border-white/10',
    text: 'text-white/80',
  },
  win: {
    bar: 'bg-green-950 border-green-500/30',
    text: 'text-green-300',
  },
  loss: {
    bar: 'bg-orange-950 border-orange-500/25',
    text: 'text-orange-300',
  },
};

export default function GameMessageBar() {
  const { message, messageType } = useGame();
  const s = styles[messageType];

  return (
    <div className={`w-full border-b transition-colors duration-300 ${s.bar}`}>
      <p
        key={message}
        className={`msg-in text-sm font-semibold text-center py-2 transition-colors duration-300 ${s.text}`}
      >
        {message}
      </p>
    </div>
  );
}
