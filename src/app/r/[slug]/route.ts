import { NextRequest, NextResponse } from 'next/server';
import { recordMarketerClick } from '@/lib/marketer-track';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;
  await recordMarketerClick({ req, slug, path: '/' });

  const dest = new URL('/', req.url);
  return NextResponse.redirect(dest, 302);
}
