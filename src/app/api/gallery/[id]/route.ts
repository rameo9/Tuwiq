import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';

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
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.src !== undefined) data.src = String(body.src).trim();
    if (body.titleAr !== undefined) data.titleAr = String(body.titleAr).trim();
    if (body.titleEn !== undefined) data.titleEn = String(body.titleEn).trim();
    if (body.category !== undefined) data.category = String(body.category).trim();
    if (body.size !== undefined) data.size = String(body.size).trim();
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    const updated = await prisma.galleryItem.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
