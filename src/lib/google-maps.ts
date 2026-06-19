/** Converts share / place / embed Google Maps URLs to an iframe embed src. */
export function toGoogleMapsEmbedUrl(input: string | undefined | null): string | null {
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
      return embedFromQuery(q);
    }

    const placeMatch = url.pathname.match(/\/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      const label = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
      return embedFromQuery(label);
    }
  } catch {
    /* not a valid URL — treat as plain address below */
  }

  return embedFromQuery(raw);
}

/** Opens the location in Google Maps (new tab). */
export function toGoogleMapsOpenUrl(input: string | undefined | null): string | null {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    if (/google\.com\/maps\/embed/i.test(raw)) {
      const embed = toGoogleMapsEmbedUrl(raw);
      if (!embed) return null;
      const q = embed.match(/[?&]q=([^&]+)/)?.[1];
      if (q) return `https://www.google.com/maps/search/?api=1&query=${q}`;
    }
    return raw;
  }

  const coords = raw.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (coords) {
    return `https://www.google.com/maps/search/?api=1&query=${coords[1]},${coords[2]}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(raw)}`;
}

function embedFromCoords(lat: string, lng: string) {
  return `https://www.google.com/maps?q=${lat},${lng}&hl=ar&z=15&output=embed`;
}

function embedFromQuery(query: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=ar&z=15&output=embed`;
}
