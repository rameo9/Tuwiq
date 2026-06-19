import type { NextRequest } from 'next/server';

export function getCountryFromRequest(req: NextRequest | Request): string {
  const headers = req.headers;

  const fromHeader =
    headers.get('cf-ipcountry') ||
    headers.get('x-vercel-ip-country') ||
    headers.get('x-country-code') ||
    headers.get('cloudfront-viewer-country');

  if (fromHeader && fromHeader !== 'XX' && fromHeader !== 'T1') {
    return fromHeader.toUpperCase();
  }

  return 'Unknown';
}

export function getUserAgent(req: NextRequest | Request): string {
  return req.headers.get('user-agent')?.slice(0, 512) ?? '';
}
