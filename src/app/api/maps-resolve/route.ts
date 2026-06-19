import { NextRequest, NextResponse } from 'next/server';

const SHORT_MAPS =
  /^(https?:\/\/)?(maps\.app\.goo\.gl|goo\.gl\/maps|maps\.google\.com\/\?)/i;

/** Follow redirects for shortened Google Maps links and return the final URL. */
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

    return NextResponse.json({
      url: res.url || parsed.toString(),
      short: SHORT_MAPS.test(url),
    });
  } catch {
    return NextResponse.json({ error: 'Resolve failed' }, { status: 502 });
  }
}
