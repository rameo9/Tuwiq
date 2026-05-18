import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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
