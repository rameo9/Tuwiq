import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/api-auth';
import { mergeSitePatch, parseSiteFromDb } from '@/lib/cms-merge';

export async function GET() {
  const row = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
  const merged = parseSiteFromDb(row?.value ?? null);
  return NextResponse.json(merged);
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const row = await prisma.siteSetting.findUnique({ where: { key: 'site' } });
    const merged = mergeSitePatch(body as Record<string, unknown>, row?.value ?? null);
    const value = JSON.stringify(merged);
    await prisma.siteSetting.upsert({
      where: { key: 'site' },
      update: { value },
      create: { key: 'site', value },
    });
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json({ error: 'Save failed' }, { status: 400 });
  }
}
