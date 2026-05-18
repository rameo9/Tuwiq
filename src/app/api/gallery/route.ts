import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

export async function GET() {
  const items = await prisma.galleryItem.findMany({
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
    const src = String(body.src ?? '').trim();
    const titleAr = String(body.titleAr ?? '').trim();
    const titleEn = String(body.titleEn ?? '').trim();
    const category = String(body.category ?? 'interior').trim();
    const size = String(body.size ?? 'medium').trim();
    if (!src) {
      return NextResponse.json({ error: 'Missing src' }, { status: 400 });
    }
    const maxSort =
      (
        await prisma.galleryItem.aggregate({
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1;

    const item = await prisma.galleryItem.create({
      data: {
        src,
        titleAr,
        titleEn,
        category,
        size,
        sortOrder: maxSort + 1,
      },
    });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  }
}
