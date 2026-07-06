import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuspiciousClick } from '@/lib/click-classify';
import { normalizeMarketerSlug, parseDeviceType } from '@/lib/marketer-utils';
import { getUserAgent, resolveCountry } from '@/lib/request-geo';

type RecordClickInput = {
  req: NextRequest | Request;
  slug: string;
  path: string;
  projectId?: number | null;
};

export async function recordMarketerClick(input: RecordClickInput): Promise<boolean> {
  const slug = normalizeMarketerSlug(input.slug);
  if (!slug) return false;

  const marketer = await prisma.marketer.findFirst({
    where: { slug, enabled: true },
  });
  if (!marketer) return false;

  const ua = getUserAgent(input.req);
  const country = await resolveCountry(input.req);
  const deviceType = parseDeviceType(ua);

  let projectId: number | null = input.projectId ?? null;
  if (projectId == null) {
    const m = input.path.match(/^\/projects\/(\d+)/);
    if (m) projectId = Number(m[1]);
  }

  await prisma.marketerClick.create({
    data: {
      marketerId: marketer.id,
      path: input.path,
      projectId,
      country,
      deviceType,
      userAgent: ua,
      isSuspicious: isSuspiciousClick(ua),
    },
  });

  return true;
}

export async function findMarketerBySlug(slug: string) {
  const normalized = normalizeMarketerSlug(slug);
  if (!normalized) return null;
  return prisma.marketer.findFirst({
    where: { slug: normalized, enabled: true },
  });
}
