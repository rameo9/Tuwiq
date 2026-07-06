import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';
import { resolveClickSuspicious, splitClickCounts } from '@/lib/click-classify';
import { normalizeMarketerSlug } from '@/lib/marketer-utils';

type RouteCtx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const marketer = await prisma.marketer.findUnique({
    where: { id },
    include: {
      _count: { select: { clicks: true } },
    },
  });

  if (!marketer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const [byCountryRaw, byDeviceRaw, byPathRaw, recentClicksRaw, allClicks, projects] =
    await Promise.all([
    prisma.marketerClick.groupBy({
      by: ['country'],
      where: { marketerId: id },
      _count: { _all: true },
    }),
    prisma.marketerClick.groupBy({
      by: ['deviceType'],
      where: { marketerId: id },
      _count: { _all: true },
    }),
    prisma.marketerClick.groupBy({
      by: ['path'],
      where: { marketerId: id },
      _count: { _all: true },
    }),
    prisma.marketerClick.findMany({
      where: { marketerId: id },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        path: true,
        projectId: true,
        country: true,
        deviceType: true,
        userAgent: true,
        isSuspicious: true,
        createdAt: true,
      },
    }),
    prisma.marketerClick.findMany({
      where: { marketerId: id },
      select: { isSuspicious: true, userAgent: true },
    }),
    prisma.project.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, titleAr: true, titleEn: true },
    }),
  ]);

  const clickKinds = splitClickCounts(allClicks);
  const recentClicks = recentClicksRaw.map((c) => ({
    id: c.id,
    path: c.path,
    projectId: c.projectId,
    country: c.country,
    deviceType: c.deviceType,
    createdAt: c.createdAt,
    isSuspicious: resolveClickSuspicious(c),
  }));

  const byCountry = [...byCountryRaw].sort((a, b) => b._count._all - a._count._all);
  const byDevice = [...byDeviceRaw].sort((a, b) => b._count._all - a._count._all);
  const byPath = [...byPathRaw].sort((a, b) => b._count._all - a._count._all).slice(0, 20);

  return NextResponse.json({
    marketer: {
      id: marketer.id,
      name: marketer.name,
      slug: marketer.slug,
      enabled: marketer.enabled,
      notes: marketer.notes,
      createdAt: marketer.createdAt,
      updatedAt: marketer.updatedAt,
      clickCount: marketer._count.clicks,
      realClickCount: clickKinds.real,
      suspiciousClickCount: clickKinds.suspicious,
    },
    stats: {
      total: clickKinds.total,
      real: clickKinds.real,
      suspicious: clickKinds.suspicious,
      byCountry: byCountry.map((r) => ({ country: r.country, count: r._count._all })),
      byDevice: byDevice.map((r) => ({ deviceType: r.deviceType, count: r._count._all })),
      byPath: byPath.map((r) => ({ path: r.path, count: r._count._all })),
      recentClicks,
    },
    projects,
  });
}

export async function PATCH(req: NextRequest, { params }: RouteCtx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.name != null) data.name = String(body.name).trim();
    if (body.slug != null) {
      const slug = normalizeMarketerSlug(String(body.slug));
      if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
      const clash = await prisma.marketer.findFirst({
        where: { slug, NOT: { id } },
      });
      if (clash) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      data.slug = slug;
    }
    if (body.notes != null) data.notes = String(body.notes).trim();
    if (body.enabled != null) data.enabled = Boolean(body.enabled);

    const updated = await prisma.marketer.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteCtx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    await prisma.marketer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
