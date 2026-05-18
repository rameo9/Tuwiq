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
    if (body.slug !== undefined) data.slug = String(body.slug).trim();
    if (body.iconId !== undefined || body.icon !== undefined) {
      data.iconId = String(body.iconId ?? body.icon).trim();
    }
    if (body.title?.ar !== undefined) data.titleAr = String(body.title.ar).trim();
    if (body.title?.en !== undefined) data.titleEn = String(body.title.en).trim();
    if (body.titleAr !== undefined) data.titleAr = String(body.titleAr).trim();
    if (body.titleEn !== undefined) data.titleEn = String(body.titleEn).trim();
    if (body.description?.ar !== undefined) {
      data.descriptionAr = String(body.description.ar).trim();
    }
    if (body.description?.en !== undefined) {
      data.descriptionEn = String(body.description.en).trim();
    }
    if (body.descriptionAr !== undefined) {
      data.descriptionAr = String(body.descriptionAr).trim();
    }
    if (body.descriptionEn !== undefined) {
      data.descriptionEn = String(body.descriptionEn).trim();
    }
    if (body.imageUrl !== undefined) data.imageUrl = String(body.imageUrl).trim();
    if (body.enabled !== undefined) data.enabled = !!body.enabled;
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder);

    const updated = await prisma.serviceItem.update({
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
    await prisma.serviceItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
