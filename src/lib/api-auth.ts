import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/** Browsers refuse Secure cookies on plain HTTP — use only real HTTPS (or terminating proxy says so). */
export function isHttpsRequest(req: NextRequest): boolean {
  const fwd = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (fwd === 'https') return true;
  if (fwd === 'http') return false;
  return new URL(req.url).protocol === 'https:';
}

export function encodedJwtSecret(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    'development-secret-change-before-production-min-32-chars-xx';
  return new TextEncoder().encode(secret);
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = cookies().get('saqr_admin_token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, encodedJwtSecret());
    return true;
  } catch {
    return false;
  }
}
