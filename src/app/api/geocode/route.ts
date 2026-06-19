import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'Missing q' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent': 'TuwaiqRealEstate/1.0 (https://tuwaiqapex.com)',
          Accept: 'application/json',
        },
        next: { revalidate: 86400 },
      },
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocode failed' }, { status: 502 });
    }

    const rows = (await res.json()) as Array<{ lat: string; lon: string; display_name?: string }>;
    const hit = rows[0];
    if (!hit) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      lat: Number(hit.lat),
      lon: Number(hit.lon),
      label: hit.display_name ?? q,
    });
  } catch {
    return NextResponse.json({ error: 'Geocode failed' }, { status: 502 });
  }
}
