import { headers } from 'next/headers';

/** Public site origin for OG tags and absolute asset URLs. */
export function getSiteOrigin(): string {
  const fromEnv =
    process.env.SITE_URL?.trim().replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}

/** Uses the incoming request host (works on tuwaiqapex.com without extra env). */
export function getRequestOrigin(): string {
  try {
    const h = headers();
    const host =
      h.get('x-forwarded-host')?.split(',')[0]?.trim() || h.get('host')?.trim();
    if (host) {
      const proto =
        h.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'https';
      return `${proto}://${host}`;
    }
  } catch {
    /* outside request context */
  }
  return getSiteOrigin();
}

export function toAbsoluteUrl(path: string | null | undefined, origin?: string): string {
  const raw = String(path ?? '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) return raw;

  const base = (origin ?? getSiteOrigin()).replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
