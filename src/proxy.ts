import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/v1/')) {
    return proxyApiRequest(request);
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
    return proxyAuthGuard(request);
  }

  return NextResponse.next();
}

function proxyApiRequest(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;

  const headers = new Headers(request.headers);
  headers.set('Host', new URL(API_URL).host);
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const url = new URL(request.nextUrl.pathname + request.nextUrl.search, API_URL);

  return NextResponse.rewrite(url, {
    request: { headers },
  });
}

function proxyAuthGuard(request: NextRequest) {
  const authToken = request.cookies.get('auth_token')?.value;
  const loginUrl = new URL('/login', request.url);

  if (!authToken) {
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/v1/:path*', '/admin/:path*', '/user/:path*'],
};
