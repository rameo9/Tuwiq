import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';
import { normalizeMarketerSlug, slugifyMarketer } from '@/lib/marketer-utils';

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const marketers = await prisma.marketer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { clicks: true } },
    },
  });

  return NextResponse.json(
    marketers.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      enabled: m.enabled,
      notes: m.notes,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      clickCount: m._count.clicks,
    })),
  );
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const name = String(body.name ?? '').trim();
    let slug = normalizeMarketerSlug(String(body.slug ?? slugifyMarketer(name)));
    const notes = String(body.notes ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }
    if (!slug) slug = slugifyMarketer(name);

    const existing = await prisma.marketer.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const marketer = await prisma.marketer.create({
      data: { name, slug, notes, enabled: body.enabled !== false },
    });

    return NextResponse.json(marketer);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Create failed' }, { status: 400 });
  }
}
