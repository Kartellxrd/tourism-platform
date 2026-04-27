import { NextResponse } from 'next/server';

const publicPaths = ['/login', '/register', '/api/login', '/api/register'];
const adminPaths = ['/admin'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  if (publicPaths.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check if accessing admin path
  if (pathname.startsWith('/admin')) {
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      const roles = payload.realm_access?.roles || [];
      const isAdmin = roles.includes('admin');
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};