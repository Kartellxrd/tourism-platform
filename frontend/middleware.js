import { NextResponse } from 'next/server';

export function middleware(request) {
  // 1. Get the token/session from cookies
  // Replace 'auth_token' with whatever name you use when saving the cookie at login
  const token = request.cookies.get('auth_token')?.value;

  const { pathname } = request.nextUrl;

  // 2. Define protected routes
  // This ensures anything starting with /dashboard or /ai-planner is guarded
  const isProtectedRoute = pathname.startsWith('/dashboard') || 
                           pathname.startsWith('/ai-planner') ||
                           pathname.startsWith('/settings');

  // 3. Redirect logic
  if (isProtectedRoute && !token) {
    // If trying to access a protected route without a token, redirect to login
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Prevent logged-in users from hitting the login page again
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// 5. Configure the Matcher
// This tells Next.js exactly which paths to run the middleware on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/ai-planner/:path*',
    '/settings/:path*',
    '/login'
  ],
};