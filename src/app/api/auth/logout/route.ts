import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { isHttpsRequest } from '@/lib/api-auth';

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('saqr_admin_token', '', {
    httpOnly: true,
    secure: isHttpsRequest(req),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
