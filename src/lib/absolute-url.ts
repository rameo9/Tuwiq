/** Public site origin for OG tags and absolute asset URLs. */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, '');
    return `https://${host}`;
  }

  return 'http://localhost:3000';
}

export function toAbsoluteUrl(path: string | null | undefined, origin?: string): string {
  const raw = String(path ?? '').trim();
  if (!raw) return '';

  if (/^https?:\/\//i.test(raw)) return raw;

  const base = (origin ?? getSiteOrigin()).replace(/\/$/, '');
  return `${base}${raw.startsWith('/') ? raw : `/${raw}`}`;
}
