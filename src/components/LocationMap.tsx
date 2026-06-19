'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, MapPin } from 'lucide-react';
import {
  getGoogleMapsEmbedUrl,
  isGoogleMapsLink,
  isShortGoogleMapsUrl,
  looksLikeHttpUrl,
  toGoogleMapsOpenUrl,
  toOpenStreetMapEmbedUrl,
} from '@/lib/google-maps';

async function resolveGoogleMapsUrl(input: string): Promise<string> {
  const raw = input.trim();
  if (!raw) return raw;

  const needsResolve =
    isShortGoogleMapsUrl(raw) ||
    (looksLikeHttpUrl(raw) && isGoogleMapsLink(raw) && !getGoogleMapsEmbedUrl(raw));

  if (!needsResolve) return raw;

  try {
    const res = await fetch(`/api/maps-resolve?url=${encodeURIComponent(raw)}`);
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      if (data.url?.trim()) return data.url.trim();
    }
  } catch {
    /* keep original */
  }

  return raw;
}

type LocationMapProps = {
  mapUrl?: string | null;
  query: string;
  openLabel: string;
  loadingLabel: string;
  mapPromptLabel?: string;
  className?: string;
};

export default function LocationMap({
  mapUrl,
  query,
  openLabel,
  loadingLabel,
  mapPromptLabel = 'اضغط لفتح الموقع على الخريطة',
  className = 'rounded-2xl overflow-hidden aspect-video',
}: LocationMapProps) {
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvedOpenUrl, setResolvedOpenUrl] = useState<string | null>(null);

  const rawOpenUrl = toGoogleMapsOpenUrl(mapUrl?.trim() || query);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setEmbedSrc(null);
      setResolvedOpenUrl(null);

      const candidates = [mapUrl?.trim(), query.trim()].filter(Boolean) as string[];

      for (const candidate of candidates) {
        const resolved = await resolveGoogleMapsUrl(candidate);
        if (!cancelled && isGoogleMapsLink(resolved)) {
          setResolvedOpenUrl(toGoogleMapsOpenUrl(resolved));
        }

        const embed = getGoogleMapsEmbedUrl(resolved) ?? getGoogleMapsEmbedUrl(candidate);
        if (embed) {
          if (!cancelled) {
            setEmbedSrc(embed);
            setLoading(false);
          }
          return;
        }
      }

      const label = query.trim();
      if (label && !looksLikeHttpUrl(label) && !isGoogleMapsLink(label)) {
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
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [mapUrl, query]);

  const openUrl = resolvedOpenUrl ?? rawOpenUrl;
  const fallbackLabel =
    looksLikeHttpUrl(query) || isGoogleMapsLink(query) ? mapPromptLabel : query;

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
            title={fallbackLabel}
            className="grayscale hover:grayscale-0 transition-all duration-500 w-full h-full min-h-[240px]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[240px] p-6 bg-slate-100 dark:bg-dark-800 text-center">
            <MapPin className="w-10 h-10 text-gold-500" />
            <p className="text-slate-700 dark:text-dark-300">{fallbackLabel}</p>
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
