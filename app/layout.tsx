import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import GameMessageBar from '@/components/GameMessageBar';
import GameInfoBlock from '@/components/GameInfoBlock';
import { GameProvider } from '@/context/GameContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Just Rolling',
  description: 'The game never stops.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#05060A]`}
    >
      <body className="h-screen flex flex-col overflow-hidden bg-[#05060A]">
        <GameProvider>
          <Header />
          <GameInfoBlock />
          <GameMessageBar />
          {children}
        </GameProvider>
      </body>
    </html>
  );
}
