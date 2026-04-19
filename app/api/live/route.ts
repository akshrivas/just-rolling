import { NextResponse } from 'next/server';

const ROUND_DURATION = 30;
const GENESIS = 1700000000;

// 🎲 deterministic dice
function getDiceResult(seed: number) {
  const x = Math.sin(seed) * 10000;
  return (((Math.floor(x) % 6) + 6) % 6) + 1;
}

export async function GET() {
  const now = Math.floor(Date.now() / 1000);

  // internal slice (not exposed)
  const slice = Math.floor((now - GENESIS) / ROUND_DURATION);

  const secondsIntoSlice = (now - GENESIS) % ROUND_DURATION;
  const timeLeft = ROUND_DURATION - secondsIntoSlice;

  const result = getDiceResult(slice);
  const previousResult = getDiceResult(slice - 1);

  return NextResponse.json({
    result,
    previousResult,
    timeLeft,
    roundDuration: ROUND_DURATION,
    round: slice,
    serverTime: now,
  });
}
