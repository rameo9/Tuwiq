'use client';

import { useEffect } from 'react';

/** Records marketer referral clicks when visitors land with ?ref=slug */
export default function MarketingTracker() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref')?.trim();
    if (!ref) return;

    const path = window.location.pathname;
    const projectMatch = path.match(/^\/projects\/(\d+)/);
    const projectId = projectMatch ? projectMatch[1] : undefined;

    const dedupeKey = `mkt_${ref}_${path}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, '1');

    void fetch('/api/marketing/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref, path, projectId }),
      keepalive: true,
    });
  }, []);

  return null;
}
