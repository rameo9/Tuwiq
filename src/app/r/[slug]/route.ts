import { NextRequest, NextResponse } from 'next/server';
import { redirectUrlForRequest } from '@/lib/absolute-url';
import { recordMarketerClick } from '@/lib/marketer-track';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  await recordMarketerClick({ req, slug: params.slug, path: '/' });
  return NextResponse.redirect(redirectUrlForRequest(req, '/'), 302);
}
