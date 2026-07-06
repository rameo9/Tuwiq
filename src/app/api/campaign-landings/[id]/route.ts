import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';
import { normalizeCampaignLinkInput, normalizeCampaignSlug, type CampaignLinkInput } from '@/lib/campaign-landing';

type RouteCtx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: RouteCtx) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const landing = await prisma.campaignLanding.findUnique({
    where: { id },
    include: {
      links: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { clicks: true } } },
      },
    },
  });

  if (!landing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const linkIds = landing.links.map((l) => l.id);

  const [byCountryRaw, byDeviceRaw, recentClicks, projects] = await Promise.all([
    linkIds.length
      ? prisma.campaignLandingLinkClick.groupBy({
          by: ['country'],
          where: { linkId: { in: linkIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    linkIds.length
      ? prisma.campaignLandingLinkClick.groupBy({
          by: ['deviceType'],
          where: { linkId: { in: linkIds } },
          _count: { _all: true },
        })
      : Promise.resolve([]),
    linkIds.length
      ? prisma.campaignLandingLinkClick.findMany({
          where: { linkId: { in: linkIds } },
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            link: { select: { titleAr: true, titleEn: true, type: true } },
          },
        })
      : Promise.resolve([]),
    prisma.project.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, titleAr: true, titleEn: true, mainImageUrl: true },
    }),
  ]);

  const linkStats = await Promise.all(
    landing.links.map(async (link) => {
      const [byCountry, byDevice] = await Promise.all([
        prisma.campaignLandingLinkClick.groupBy({
          by: ['country'],
          where: { linkId: link.id },
          _count: { _all: true },
        }),
        prisma.campaignLandingLinkClick.groupBy({
          by: ['deviceType'],
          where: { linkId: link.id },
          _count: { _all: true },
        }),
      ]);
      return {
        linkId: link.id,
        clickCount: link._count.clicks,
        byCountry: byCountry
          .map((r) => ({ country: r.country, count: r._count._all }))
          .sort((a, b) => b.count - a.count),
        byDevice: byDevice
          .map((r) => ({ deviceType: r.deviceType, count: r._count._all }))
          .sort((a, b) => b.count - a.count),
      };
    }),
  );

  const totalClicks = landing.links.reduce((sum, l) => sum + l._count.clicks, 0);

  return NextResponse.json({
    landing: {
      id: landing.id,
      name: landing.name,
      slug: landing.slug,
      titleAr: landing.titleAr,
      titleEn: landing.titleEn,
      descriptionAr: landing.descriptionAr,
      descriptionEn: landing.descriptionEn,
      enabled: landing.enabled,
      viewCount: landing.viewCount,
      createdAt: landing.createdAt,
      updatedAt: landing.updatedAt,
      links: landing.links.map((link) => ({
        id: link.id,
        type: link.type,
        titleAr: link.titleAr,
        titleEn: link.titleEn,
        url: link.url,
        projectId: link.projectId,
        sortOrder: link.sortOrder,
        enabled: link.enabled,
        clickCount: link._count.clicks,
      })),
    },
    stats: {
      viewCount: landing.viewCount,
      totalClicks,
      byCountry: [...byCountryRaw]
        .map((r) => ({ country: r.country, count: r._count._all }))
        .sort((a, b) => b.count - a.count),
      byDevice: [...byDeviceRaw]
        .map((r) => ({ deviceType: r.deviceType, count: r._count._all }))
        .sort((a, b) => b.count - a.count),
      linkStats,
      recentClicks: recentClicks.map((c) => ({
        id: c.id,
        linkId: c.linkId,
        linkTitleAr: c.link.titleAr,
        linkTitleEn: c.link.titleEn,
        linkType: c.link.type,
        country: c.country,
        deviceType: c.deviceType,
        createdAt: c.createdAt,
      })),
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
    if (body.titleAr != null) data.titleAr = String(body.titleAr).trim();
    if (body.titleEn != null) data.titleEn = String(body.titleEn).trim();
    if (body.descriptionAr != null) data.descriptionAr = String(body.descriptionAr).trim();
    if (body.descriptionEn != null) data.descriptionEn = String(body.descriptionEn).trim();
    if (body.enabled != null) data.enabled = Boolean(body.enabled);

    if (body.slug != null) {
      const slug = normalizeCampaignSlug(String(body.slug));
      if (!slug) return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
      const clash = await prisma.campaignLanding.findFirst({
        where: { slug, NOT: { id } },
      });
      if (clash) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
      data.slug = slug;
    }

    if (Array.isArray(body.links)) {
      const links = (body.links as CampaignLinkInput[]).map((raw, index) =>
        normalizeCampaignLinkInput(raw, index),
      );
      await prisma.$transaction([
        prisma.campaignLandingLink.deleteMany({ where: { landingId: id } }),
        prisma.campaignLanding.update({
          where: { id },
          data: {
            ...data,
            links: {
              create: links.map((link) => ({
                type: link.type,
                titleAr: link.titleAr,
                titleEn: link.titleEn,
                url: link.url,
                projectId: link.projectId,
                sortOrder: link.sortOrder,
                enabled: link.enabled,
              })),
            },
          },
        }),
      ]);
      const updated = await prisma.campaignLanding.findUnique({
        where: { id },
        include: { links: { orderBy: { sortOrder: 'asc' } } },
      });
      return NextResponse.json(updated);
    }

    const updated = await prisma.campaignLanding.update({ where: { id }, data });
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
    await prisma.campaignLanding.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
