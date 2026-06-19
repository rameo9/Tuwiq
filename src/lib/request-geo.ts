import type { NextRequest } from 'next/server';

export function getClientIp(req: NextRequest | Request): string {
  const headers = req.headers;
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (forwarded) return forwarded;
  const real = headers.get('x-real-ip')?.trim();
  if (real) return real;
  return '';
}

function isPrivateIp(ip: string): boolean {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)) return true;
  return false;
}

export function getCountryFromHeaders(req: NextRequest | Request): string | null {
  const fromHeader =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    req.headers.get('x-country-code') ||
    req.headers.get('cloudfront-viewer-country');

  if (fromHeader && fromHeader !== 'XX' && fromHeader !== 'T1') {
    return fromHeader.toUpperCase();
  }
  return null;
}

const geoCache = new Map<string, { country: string; at: number }>();
const GEO_TTL_MS = 24 * 60 * 60 * 1000;

async function lookupCountryByIp(ip: string): Promise<string | null> {
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.at < GEO_TTL_MS) return cached.country;

  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data = (await res.json()) as { success?: boolean; country_code?: string };
    if (data.success && data.country_code) {
      const country = data.country_code.toUpperCase();
      geoCache.set(ip, { country, at: Date.now() });
      return country;
    }
  } catch {
    /* fallback below */
  }

  return null;
}

/** Cloudflare/CDN header first, then IP geolocation (ipwho.is). */
export async function resolveCountry(req: NextRequest | Request): Promise<string> {
  const fromHeader = getCountryFromHeaders(req);
  if (fromHeader) return fromHeader;

  const ip = getClientIp(req);
  if (!ip || isPrivateIp(ip)) return 'Unknown';

  const fromIp = await lookupCountryByIp(ip);
  return fromIp ?? 'Unknown';
}

export function getUserAgent(req: NextRequest | Request): string {
  return req.headers.get('user-agent')?.slice(0, 512) ?? '';
}

/** @deprecated use resolveCountry */
export function getCountryFromRequest(req: NextRequest | Request): string {
  return getCountryFromHeaders(req) ?? 'Unknown';
}
