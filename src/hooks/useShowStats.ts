'use client';

import { useCallback, useEffect, useState } from 'react';

export const STATS_HIDDEN_KEY = 'tuwaiq_hero_stats_hidden';
export const STATS_HIDDEN_EVENT = 'tuwaiq-stats-hidden';

export function useShowStats(cmsEnabled: boolean | undefined): boolean {
  const [dismissed, setDismissed] = useState(false);

  const readHidden = useCallback(() => {
    try {
      setDismissed(localStorage.getItem(STATS_HIDDEN_KEY) === '1');
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => {
    readHidden();
    window.addEventListener(STATS_HIDDEN_EVENT, readHidden);
    window.addEventListener('storage', readHidden);
    return () => {
      window.removeEventListener(STATS_HIDDEN_EVENT, readHidden);
      window.removeEventListener('storage', readHidden);
    };
  }, [readHidden]);

  return cmsEnabled !== false && !dismissed;
}

export function hideSiteStats(): void {
  try {
    localStorage.setItem(STATS_HIDDEN_KEY, '1');
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(STATS_HIDDEN_EVENT));
}
