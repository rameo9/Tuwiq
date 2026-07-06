import { NextRequest, NextResponse } from 'next/server';
import { getOriginFromRequest, redirectUrlForRequest } from '@/lib/absolute-url';
import { recordCampaignLinkClick } from '@/lib/campaign-landing-track';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string; linkId: string } },
) {
  const linkId = Number(params.linkId);
  if (!Number.isFinite(linkId)) {
    return NextResponse.redirect(redirectUrlForRequest(req, '/'), 302);
  }

  const origin = getOriginFromRequest(req).replace(/\/$/, '');

  const destination = await recordCampaignLinkClick({
    req,
    landingSlug: params.slug,
    linkId,
    siteOrigin: origin,
  });

  if (!destination || destination === '#') {
    return NextResponse.redirect(redirectUrlForRequest(req, '/'), 302);
  }

  if (destination.startsWith('/') || destination.startsWith(origin)) {
    const path = destination.startsWith('/')
      ? destination
      : destination.slice(origin.length) || '/';
    return NextResponse.redirect(redirectUrlForRequest(req, path), 302);
  }

  return NextResponse.redirect(destination, 302);
}
