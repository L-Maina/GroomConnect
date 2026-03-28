import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/customer-dashboard',
  '/business-dashboard',
  '/admin-dashboard',
  '/onboarding',
  '/bookings',
  '/favorites',
  '/messages',
  '/chat',
  '/calendar',
  '/settings',
  '/profile',
  '/earnings',
  '/disputes',
];

// Routes that require admin role
const adminRoutes = [
  '/admin-dashboard',
  '/admin',
];

// Routes that require provider role
const providerRoutes = [
  '/business-dashboard',
  '/calendar',
  '/earnings',
];

// Routes accessible only by guests (not logged in)
const guestOnlyRoutes = [
  '/login',
  '/register',
  '/forgot-password',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get auth token from cookies
  const authToken = request.cookies.get('auth-token')?.value;
  const userRoles = request.cookies.get('user-roles')?.value;
  const userActiveMode = request.cookies.get('user-active-mode')?.value;
  
  // Parse user roles
  const roles = userRoles ? userRoles.split(',') : [];
  const isAuthenticated = !!authToken;
  const isAdmin = roles.includes('ADMIN');
  const isProvider = roles.includes('BUSINESS_OWNER');
  const activeMode = userActiveMode || 'CLIENT';

  // Check if trying to access guest-only routes while authenticated
  if (guestOnlyRoutes.some(route => pathname.startsWith(route))) {
    if (isAuthenticated) {
      // Redirect authenticated users to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check if trying to access protected routes without authentication
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check admin route access
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!isAdmin) {
      // Redirect non-admins to home
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Check provider route access
  if (providerRoutes.some(route => pathname.startsWith(route))) {
    if (!isProvider) {
      // Redirect non-providers to onboarding or home
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  // XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'none';"
  );

  return response;
}

// Configure matcher for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
