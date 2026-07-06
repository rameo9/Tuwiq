import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';
import {
  normalizeCampaignLinkInput,
  normalizeCampaignSlug,
  slugifyCampaignLanding,
  type CampaignLinkInput,
} from '@/lib/campaign-landing';

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const landings = await prisma.campaignLanding.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      links: {
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { clicks: true } } },
      },
    },
  });

  return NextResponse.json(
    landings.map((l) => ({
      id: l.id,
      name: l.name,
      slug: l.slug,
      titleAr: l.titleAr,
      titleEn: l.titleEn,
      descriptionAr: l.descriptionAr,
      descriptionEn: l.descriptionEn,
      enabled: l.enabled,
      viewCount: l.viewCount,
      createdAt: l.createdAt,
      updatedAt: l.updatedAt,
      totalLinkClicks: l.links.reduce((sum, link) => sum + link._count.clicks, 0),
      links: l.links.map((link) => ({
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
    let slug = normalizeCampaignSlug(String(body.slug ?? slugifyCampaignLanding(name)));
    const titleAr = String(body.titleAr ?? name).trim();
    const titleEn = String(body.titleEn ?? name).trim();
    const descriptionAr = String(body.descriptionAr ?? '').trim();
    const descriptionEn = String(body.descriptionEn ?? '').trim();
    const linksRaw = Array.isArray(body.links) ? body.links : [];

    if (!name) {
      return NextResponse.json({ error: 'Name required' }, { status: 400 });
    }
    if (!slug) slug = slugifyCampaignLanding(name);

    const existing = await prisma.campaignLanding.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const links = (linksRaw as CampaignLinkInput[]).map((raw, index) =>
      normalizeCampaignLinkInput(raw, index),
    );

    const landing = await prisma.campaignLanding.create({
      data: {
        name,
        slug,
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        enabled: body.enabled !== false,
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
      include: { links: { orderBy: { sortOrder: 'asc' } } },
    });

    return NextResponse.json(landing);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Create failed' }, { status: 400 });
  }
}
