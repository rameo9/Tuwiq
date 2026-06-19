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

    const placeMatch = url.pathname.match(/\/maps\/place\//);
    if (placeMatch) {
      const pinInPath = raw.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (pinInPath) return embedFromCoords(pinInPath[1], pinInPath[2]);
      const atInRaw = raw.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      if (atInRaw) return embedFromCoords(atInRaw[1], atInRaw[2]);
    }
  } catch {
    /* plain text — not a precise embed source */
  }

  return null;
}

export function isShortGoogleMapsUrl(input: string | undefined | null): boolean {
  const raw = String(input ?? '').trim();
  if (!raw) return false;
  return /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(raw);
}

export function isGoogleMapsLink(input: string | undefined | null): boolean {
  const raw = String(input ?? '').trim();
  if (!raw) return false;
  if (isShortGoogleMapsUrl(raw)) return true;
  try {
    const url = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase();
    return host.includes('google.') && (raw.includes('/maps') || url.searchParams.has('q'));
  } catch {
    return false;
  }
}

export function looksLikeHttpUrl(input: string | undefined | null): boolean {
  return /^https?:\/\//i.test(String(input ?? '').trim());
}

/** @deprecated Use getGoogleMapsEmbedUrl; kept for callers that geocode plain text separately. */
export function toGoogleMapsEmbedUrl(input: string | undefined | null): string | null {
  return getGoogleMapsEmbedUrl(input);
}

/** Opens the location in Google Maps (new tab). */
export function toGoogleMapsOpenUrl(input: string | undefined | null): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  if (looksLikeHttpUrl(raw)) {
    if (/google\.com\/maps\/embed/i.test(raw)) {
      const embed = getGoogleMapsEmbedUrl(raw);
      const q = embed?.match(/[?&]q=([^&]+)/)?.[1];
      if (q) return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    if (isGoogleMapsLink(raw)) return raw.startsWith('http') ? raw : `https://${raw}`;
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

export function extractCoordsFromGoogleMaps(
  input: string | undefined | null,
): { lat: number; lon: number } | null {
  const raw = String(input ?? '');
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
    /[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /center=(-?\d+(?:\.\d+)?)[,%2C](-?\d+(?:\.\d+)?)/i,
    /[?&]ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ];

  for (const re of patterns) {
    const m = raw.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
  }
  return null;
}

export function embedUrlFromCoords(lat: number, lon: number): string {
  return embedFromCoords(String(lat), String(lon));
}
