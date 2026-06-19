import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCountryFromRequest, getUserAgent } from '@/lib/request-geo';
import { normalizeMarketerSlug, parseDeviceType } from '@/lib/marketer-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const slug = normalizeMarketerSlug(String(body.ref ?? body.slug ?? ''));
    const path = String(body.path ?? '/').trim() || '/';
    const projectIdRaw = body.projectId;

    if (!slug) {
      return NextResponse.json({ error: 'Missing ref' }, { status: 400 });
    }

    const marketer = await prisma.marketer.findFirst({
      where: { slug, enabled: true },
    });

    if (!marketer) {
      return NextResponse.json({ ok: false, reason: 'unknown_marketer' });
    }

    let projectId: number | null = null;
    if (projectIdRaw != null && projectIdRaw !== '') {
      const n = Number(projectIdRaw);
      if (Number.isFinite(n)) projectId = n;
    } else {
      const m = path.match(/^\/projects\/(\d+)/);
      if (m) projectId = Number(m[1]);
    }

    const ua = getUserAgent(req);
    const country = getCountryFromRequest(req);
    const deviceType = parseDeviceType(ua);

    await prisma.marketerClick.create({
      data: {
        marketerId: marketer.id,
        path,
        projectId,
        country,
        deviceType,
        userAgent: ua,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Track failed' }, { status: 500 });
  }
}
