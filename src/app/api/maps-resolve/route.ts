import { NextRequest, NextResponse } from 'next/server';
import {
  embedUrlFromCoords,
  extractCoordsFromGoogleMaps,
  getGoogleMapsEmbedUrl,
} from '@/lib/google-maps';

const SHORT_MAPS =
  /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com\/\?)/i;

function extractCoordsFromHtml(html: string): { lat: number; lon: number } | null {
  const patterns = [
    /\[null,null,(-?\d+\.\d+),(-?\d+\.\d+)\]/,
    /"@(-?\d+\.\d+),(-?\d+\.\d+)"/,
    /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/,
    /@(-?\d+\.\d+),(-?\d+\.\d+)/,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      const lat = Number(m[1]);
      const lon = Number(m[2]);
      if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
    }
  }
  return null;
}

/** Follow redirects for shortened Google Maps links and return embed-ready data. */
export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')?.trim();
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  const host = parsed.hostname.toLowerCase();
  const allowed =
    host.endsWith('goo.gl') ||
    host.endsWith('google.com') ||
    host.endsWith('google.com.sa') ||
    host.endsWith('googleusercontent.com');

  if (!allowed) {
    return NextResponse.json({ error: 'Unsupported host' }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      next: { revalidate: 86400 },
    });

    const finalUrl = res.url || parsed.toString();
    const html = await res.text();
    const combined = `${finalUrl}\n${html}`;

    let coords = extractCoordsFromGoogleMaps(finalUrl) ?? extractCoordsFromGoogleMaps(combined);
    if (!coords) coords = extractCoordsFromHtml(html);

    const embedFromParse = getGoogleMapsEmbedUrl(finalUrl) ?? getGoogleMapsEmbedUrl(combined);
    const embedUrl =
      embedFromParse ?? (coords ? embedUrlFromCoords(coords.lat, coords.lon) : null);

    return NextResponse.json({
      url: finalUrl,
      short: SHORT_MAPS.test(url),
      ...(coords ? { lat: coords.lat, lon: coords.lon } : {}),
      ...(embedUrl ? { embedUrl } : {}),
    });
  } catch {
    return NextResponse.json({ error: 'Resolve failed' }, { status: 502 });
  }
}
