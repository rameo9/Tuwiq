'use client';

import React, { useEffect, useState } from 'react';
import { ExternalLink, Loader2, MapPin } from 'lucide-react';
import {
  embedUrlFromCoords,
  extractCoordsFromGoogleMaps,
  getGoogleMapsEmbedUrl,
  isGoogleMapsLink,
  isShortGoogleMapsUrl,
  looksLikeHttpUrl,
  toGoogleMapsOpenUrl,
  toOpenStreetMapEmbedUrl,
} from '@/lib/google-maps';

type MapsResolveResult = {
  url?: string;
  lat?: number;
  lon?: number;
  embedUrl?: string;
};

async function resolveGoogleMaps(input: string): Promise<MapsResolveResult> {
  const raw = input.trim();
  if (!raw) return { url: raw };

  const directEmbed = getGoogleMapsEmbedUrl(raw);
  const directCoords = extractCoordsFromGoogleMaps(raw);
  if (directEmbed || directCoords) {
    return {
      url: raw,
      ...(directCoords ?? {}),
      embedUrl: directEmbed ?? (directCoords ? embedUrlFromCoords(directCoords.lat, directCoords.lon) : undefined),
    };
  }

  const needsResolve =
    isShortGoogleMapsUrl(raw) ||
    (looksLikeHttpUrl(raw) && isGoogleMapsLink(raw));

  if (!needsResolve) return { url: raw };

  try {
    const res = await fetch(`/api/maps-resolve?url=${encodeURIComponent(raw)}`);
    if (res.ok) {
      const data = (await res.json()) as MapsResolveResult;
      return { url: data.url?.trim() || raw, ...data };
    }
  } catch {
    /* keep original */
  }

  return { url: raw };
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

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setEmbedSrc(null);
      setResolvedOpenUrl(null);

      const mapCandidate = mapUrl?.trim() ?? '';
      const textQuery = query.trim();
      const urlCandidates = [mapCandidate].filter(Boolean);
      if (textQuery && looksLikeHttpUrl(textQuery) && isGoogleMapsLink(textQuery)) {
        urlCandidates.push(textQuery);
      }

      for (const candidate of urlCandidates) {
        const resolved = await resolveGoogleMaps(candidate);
        const finalUrl = resolved.url ?? candidate;

        if (!cancelled && isGoogleMapsLink(finalUrl)) {
          setResolvedOpenUrl(toGoogleMapsOpenUrl(finalUrl));
        }

        const embed =
          resolved.embedUrl ??
          getGoogleMapsEmbedUrl(finalUrl) ??
          (resolved.lat != null && resolved.lon != null
            ? embedUrlFromCoords(resolved.lat, resolved.lon)
            : null);

        if (embed) {
          if (!cancelled) {
            setEmbedSrc(embed);
            setLoading(false);
          }
          return;
        }
      }

      const geocodeLabel =
        textQuery && !looksLikeHttpUrl(textQuery) && !isGoogleMapsLink(textQuery)
          ? textQuery
          : '';

      if (geocodeLabel) {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(geocodeLabel)}`);
          if (res.ok) {
            const data = (await res.json()) as { lat: number; lon: number };
            if (!cancelled) {
              setEmbedSrc(toOpenStreetMapEmbedUrl(data.lat, data.lon));
              setResolvedOpenUrl(
                `https://www.google.com/maps/search/?api=1&query=${data.lat},${data.lon}`,
              );
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

  const openUrl =
    resolvedOpenUrl ??
    toGoogleMapsOpenUrl(mapUrl?.trim() || query) ??
    (query && !looksLikeHttpUrl(query) ? toGoogleMapsOpenUrl(query) : null);

  const fallbackLabel =
    looksLikeHttpUrl(query) || isGoogleMapsLink(query)
      ? mapPromptLabel
      : query || mapPromptLabel;

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
