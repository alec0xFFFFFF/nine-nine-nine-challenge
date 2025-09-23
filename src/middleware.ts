import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('auth-token');
  const isAuthPage = request.nextUrl.pathname === '/';
  const isPublicPage = request.nextUrl.pathname === '/leaderboard';
  
  if (!authCookie && !isAuthPage && !isPublicPage && request.nextUrl.pathname.startsWith('/play')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/play/:path*']
};