// frontend/middleware.js

import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Skip all API routes — never block /api/wishlist, /api/login etc.
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/ai-planner') ||
    pathname.startsWith('/settings');

  // Not logged in + trying to access protected route → send to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already logged in + trying to visit login or register → send to dashboard
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ai-planner/:path*',
    '/settings/:path*',
    '/login',
    '/register',
  ],
};