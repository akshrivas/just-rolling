'use client';

import { useEffect, useState } from 'react';

export type LiveData = {
  result: number;
  previousResult: number;
  timeLeft: number;
};

export function useLive() {
  const [data, setData] = useState<LiveData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/live');
      const json = await res.json();
      setData(json);
    };

    fetchData();
    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  return data;
}
