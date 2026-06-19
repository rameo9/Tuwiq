'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, MapPin } from 'lucide-react';
import {
  getGoogleMapsEmbedUrl,
  toGoogleMapsOpenUrl,
  toOpenStreetMapEmbedUrl,
} from '@/lib/google-maps';

type LocationMapProps = {
  mapUrl?: string | null;
  query: string;
  openLabel: string;
  loadingLabel: string;
  className?: string;
};

export default function LocationMap({
  mapUrl,
  query,
  openLabel,
  loadingLabel,
  className = 'rounded-2xl overflow-hidden aspect-video',
}: LocationMapProps) {
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const openUrl = toGoogleMapsOpenUrl(mapUrl?.trim() || query);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setEmbedSrc(null);

      const precise =
        getGoogleMapsEmbedUrl(mapUrl ?? '') ?? getGoogleMapsEmbedUrl(query);
      if (precise) {
        if (!cancelled) {
          setEmbedSrc(precise);
          setLoading(false);
        }
        return;
      }

      const label = query.trim();
      if (!label) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(label)}`);
        if (res.ok) {
          const data = (await res.json()) as { lat: number; lon: number };
          if (!cancelled) {
            setEmbedSrc(toOpenStreetMapEmbedUrl(data.lat, data.lon));
          }
        }
      } catch {
        /* show open link only */
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapUrl, query]);

  if (loading) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-slate-100 dark:bg-dark-800 border border-slate-200/80 dark:border-white/10`}
      >
        <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        <span className="sr-only">{loadingLabel}</span>
      </div>
    );
  }

  if (!embedSrc && !openUrl) return null;

  return (
    <div>
      <div className={className}>
        {embedSrc ? (
          <iframe
            src={embedSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={query}
            className="grayscale hover:grayscale-0 transition-all duration-500 w-full h-full min-h-[240px]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[240px] p-6 bg-slate-100 dark:bg-dark-800 text-center">
            <MapPin className="w-10 h-10 text-gold-500" />
            <p className="text-slate-700 dark:text-dark-300">{query}</p>
          </div>
        )}
      </div>

      {openUrl ? (
        <a
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-gold-500 hover:text-gold-400 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          {openLabel}
        </a>
      ) : null}
    </div>
  );
}
