import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSuspiciousClick } from '@/lib/click-classify';
import { normalizeCampaignSlug, resolveCampaignLinkDestination } from '@/lib/campaign-landing';
import { parseDeviceType } from '@/lib/marketer-utils';
import { getUserAgent, resolveCountry } from '@/lib/request-geo';

export async function recordCampaignLinkClick(input: {
  req: NextRequest | Request;
  landingSlug: string;
  linkId: number;
  siteOrigin: string;
}): Promise<string | null> {
  const slug = normalizeCampaignSlug(input.landingSlug);
  if (!slug) return null;

  const landing = await prisma.campaignLanding.findFirst({
    where: { slug, enabled: true },
    include: {
      links: { where: { id: input.linkId, enabled: true } },
    },
  });

  const link = landing?.links[0];
  if (!link) return null;

  const ua = getUserAgent(input.req);
  const country = await resolveCountry(input.req);
  const deviceType = parseDeviceType(ua);

  await prisma.campaignLandingLinkClick.create({
    data: {
      linkId: link.id,
      country,
      deviceType,
      userAgent: ua,
      isSuspicious: isSuspiciousClick(ua),
    },
  });

  return resolveCampaignLinkDestination(link, input.siteOrigin);
}
