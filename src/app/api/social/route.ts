import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1';
  if (all) {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const links = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(links);
  }

  const links = await prisma.socialLink.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(links);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const links = body.links as
      | Array<{ platform: string; url: string; enabled: boolean }>
      | undefined;
    if (!Array.isArray(links)) {
      return NextResponse.json({ error: 'links array required' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.socialLink.deleteMany({});
      await tx.socialLink.createMany({
        data: links.map((l, i) => ({
          platform: String(l.platform ?? '').trim(),
          url: String(l.url ?? '').trim(),
          enabled: !!l.enabled,
          sortOrder: i,
        })),
      });
    });

    const saved = await prisma.socialLink.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(saved);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Save failed' }, { status: 400 });
  }
}
