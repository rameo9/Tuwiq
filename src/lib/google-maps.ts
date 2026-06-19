/** Google Maps embed for pb / coords / embed URLs only (not plain address text). */
export function getGoogleMapsEmbedUrl(input: string | undefined | null): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  if (/google\.com\/maps\/embed/i.test(raw)) return raw;

  const pb = raw.match(/[?&]pb=([^&]+)/)?.[1];
  if (pb) return `https://www.google.com/maps/embed?pb=${pb}`;

  const pin = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (pin) return embedFromCoords(pin[1], pin[2]);

  const at = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (at) return embedFromCoords(at[1], at[2]);

  const coordPlain = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coordPlain) return embedFromCoords(coordPlain[1], coordPlain[2]);

  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const q = url.searchParams.get('q') ?? url.searchParams.get('query');
    if (q) {
      const coordQ = q.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
      if (coordQ) return embedFromCoords(coordQ[1], coordQ[2]);
    }
  } catch {
    /* plain text — not a precise embed source */
  }

  return null;
}

/** @deprecated Use getGoogleMapsEmbedUrl; kept for callers that geocode plain text separately. */
export function toGoogleMapsEmbedUrl(input: string | undefined | null): string | null {
  return getGoogleMapsEmbedUrl(input);
}

/** Opens the location in Google Maps (new tab). */
export function toGoogleMapsOpenUrl(input: string | undefined | null): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (/google\.com\/maps\/embed/i.test(raw)) {
      const embed = getGoogleMapsEmbedUrl(raw);
      const q = embed?.match(/[?&]q=([^&]+)/)?.[1];
      if (q) return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    if (/google\.com\/maps/i.test(raw) || /maps\.google/i.test(raw)) return raw;
  }

  const coords = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[2]}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
}

export function toOpenStreetMapEmbedUrl(lat: number, lon: number): string {
  const d = 0.015;
  const bbox = `${lon - d},${lat - d},${lon + d},${lat + d}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
}

function embedFromCoords(lat: string, lng: string) {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
}
