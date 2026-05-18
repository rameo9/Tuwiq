import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { encodedJwtSecret } from '@/lib/api-auth';

export async function GET() {
  const token = cookies().get('saqr_admin_token')?.value;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  try {
    const { payload } = await jwtVerify(token, encodedJwtSecret());
    return NextResponse.json({ ok: true, username: payload.sub });
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
}
