import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: 'asc' } },
      features: { orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(project);
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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  try {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const titleAr = body.title?.ar != null ? String(body.title.ar).trim() : existing.titleAr;
    const titleEn = body.title?.en != null ? String(body.title.en).trim() : existing.titleEn;
    const locationAr =
      body.location?.ar != null ? String(body.location.ar).trim() : existing.locationAr;
    const locationEn =
      body.location?.en != null ? String(body.location.en).trim() : existing.locationEn;
    const descriptionAr =
      body.description?.ar != null
        ? String(body.description.ar).trim()
        : existing.descriptionAr;
    const descriptionEn =
      body.description?.en != null
        ? String(body.description.en).trim()
        : existing.descriptionEn;
    const area = body.area != null ? String(body.area).trim() : existing.area;
    const units = body.units != null ? String(body.units).trim() : existing.units;
    const status = body.status != null ? String(body.status).trim() : existing.status;
    const categoryAr =
      body.category?.ar != null ? String(body.category.ar).trim() : existing.categoryAr;
    const categoryEn =
      body.category?.en != null ? String(body.category.en).trim() : existing.categoryEn;
    const mainImageUrl =
      body.mainImageUrl != null
        ? String(body.mainImageUrl).trim()
        : body.image != null
          ? String(body.image).trim()
          : existing.mainImageUrl;
    const pdfUrl =
      body.pdfUrl !== undefined ? (body.pdfUrl ? String(body.pdfUrl).trim() : null) : existing.pdfUrl;
    const completionYear =
      body.completionYear !== undefined
        ? String(body.completionYear ?? '').trim()
        : existing.completionYear;

    let imagesArg:
      | { deleteMany: Record<string, never>; create: { url: string; sortOrder: number }[] }
      | undefined;

    let featuresArg:
      | {
          deleteMany: Record<string, never>;
          create: { textAr: string; textEn: string; sortOrder: number }[];
        }
      | undefined;

    if (
      body.galleryUrls !== undefined ||
      body.images !== undefined ||
      body.mainImageUrl !== undefined ||
      body.image !== undefined
    ) {
      const imgs = normalizeImages(
        mainImageUrl,
        body.galleryUrls !== undefined ? body.galleryUrls : body.images,
      );
      imagesArg = {
        deleteMany: {},
        create: imgs.map(({ url, sortOrder }) => ({ url, sortOrder })),
      };
    }

    if (body.features !== undefined) {
      const feats = normalizeFeatures(body.features).filter((f) => f.textAr || f.textEn);
      featuresArg = {
        deleteMany: {},
        create: feats,
      };
    }

    const updated = await prisma.project.update({
      where: { id },
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
        pdfUrl,
        completionYear,
        ...(imagesArg && { images: imagesArg }),
        ...(featuresArg && { features: featuresArg }),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Update failed' }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
