import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

function slugifyPrimary(titleAr: string, titleEn: string): string {
  const raw = (titleEn || titleAr || '').trim();
  const ascii = raw
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return ascii || `service-${Date.now()}`;
}

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get('all') === '1';
  if (all) {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const items = await prisma.serviceItem.findMany({
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(items);
  }

  const items = await prisma.serviceItem.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: 'asc' },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const titleAr = String(body.title?.ar ?? body.titleAr ?? '').trim();
    const titleEn = String(body.title?.en ?? body.titleEn ?? '').trim();
    const descriptionAr = String(body.description?.ar ?? body.descriptionAr ?? '').trim();
    const descriptionEn = String(body.description?.en ?? body.descriptionEn ?? '').trim();
    const iconId = String(body.icon ?? body.iconId ?? 'building').trim();
    const imageUrl = String(body.imageUrl ?? '').trim();
    const slugInput = body.slug ? String(body.slug).trim() : '';
    const slug = slugInput || slugifyPrimary(titleAr, titleEn);

    if (!titleAr || !titleEn) {
      return NextResponse.json({ error: 'Titles required' }, { status: 400 });
    }

    const maxSort =
      (
        await prisma.serviceItem.aggregate({
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1;

    const created = await prisma.serviceItem.create({
      data: {
        slug,
        titleAr,
        titleEn,
        descriptionAr,
        descriptionEn,
        iconId,
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
        enabled: body.enabled !== undefined ? !!body.enabled : true,
        sortOrder: maxSort + 1,
      },
    });
    return NextResponse.json(created);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Create failed' }, { status: 400 });
  }
}
