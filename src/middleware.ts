import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE = 'saqr_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/uploads/')) {
    const tail = pathname.slice('/uploads/'.length);
    if (tail && !tail.includes('/') && !tail.includes('..')) {
      const u = request.nextUrl.clone();
      u.pathname = `/api/file-upload/${tail}`;
      return NextResponse.rewrite(u);
    }
  }

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/uploads/:path*'],
};
