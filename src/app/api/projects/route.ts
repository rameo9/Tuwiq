import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const projects = await prisma.project.findMany({
    orderBy: { id: 'asc' },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
    },
  });
  return NextResponse.json(projects);
}

function normalizeFeatures(raw: unknown): { textAr: string; textEn: string; sortOrder: number }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f, i) => {
    const o = f as Record<string, string>;
    const textAr = String(o.ar ?? o.textAr ?? '').trim();
    const textEn = String(o.en ?? o.textEn ?? '').trim();
    return { textAr, textEn, sortOrder: i };
  });
}

function normalizeImages(mainUrl: string, extras: unknown): { url: string; sortOrder: number }[] {
  const urls: string[] = [];
  const seen = new Set<string>();
  const push = (u: string) => {
    const s = String(u || '').trim();
    if (!s || seen.has(s)) return;
    seen.add(s);
    urls.push(s);
  };
  push(mainUrl);
  if (Array.isArray(extras)) {
    extras.forEach((u) => push(String(u)));
  }
  return urls.map((url, sortOrder) => ({ url, sortOrder }));
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const titleAr = String(body.title?.ar ?? body.titleAr ?? '').trim();
    const titleEn = String(body.title?.en ?? body.titleEn ?? '').trim();
    const locationAr = String(body.location?.ar ?? body.locationAr ?? '').trim();
    const locationEn = String(body.location?.en ?? body.locationEn ?? '').trim();
    const descriptionAr = String(body.description?.ar ?? body.descriptionAr ?? '').trim();
    const descriptionEn = String(body.description?.en ?? body.descriptionEn ?? '').trim();
    const area = String(body.area ?? '').trim();
    const units = String(body.units ?? '').trim();
    const status = String(body.status ?? 'active').trim();
    const categoryAr = String(body.category?.ar ?? body.categoryAr ?? 'سكني').trim();
    const categoryEn = String(body.category?.en ?? body.categoryEn ?? 'Residential').trim();
    const mainImageUrl = String(body.mainImageUrl ?? body.image ?? '').trim();
    const pdfUrl = body.pdfUrl ? String(body.pdfUrl).trim() : null;
    const completionYear = String(body.completionYear ?? '').trim();
    const mapUrl = body.mapUrl ? String(body.mapUrl).trim() : null;

    if (!titleAr || !titleEn || !mainImageUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const galleryUrls = body.galleryUrls ?? body.images ?? [];
    const imgs = normalizeImages(mainImageUrl, galleryUrls);
    const feats = normalizeFeatures(body.features).filter((f) => f.textAr || f.textEn);

    const project = await prisma.project.create({
      data: {
        titleAr,
        titleEn,
        locationAr,
        locationEn,
        descriptionAr,
        descriptionEn,
        area,
        units,
        status,
        categoryAr,
        categoryEn,
        mainImageUrl,
        pdfUrl: pdfUrl || null,
        completionYear,
        mapUrl: mapUrl || null,
        images: {
          create: imgs.map(({ url, sortOrder }) => ({ url, sortOrder })),
        },
        features: {
          create: feats,
        },
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(project);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Create failed' }, { status: 400 });
  }
}
