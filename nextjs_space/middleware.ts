import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth?.token;
    const path = req.nextUrl.pathname;

    // Admin route protection
    if (path.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Unapproved users get sent to /pending
    if (token && !token.approved && path !== '/pending' && !path.startsWith('/api') && path !== '/login' && path !== '/signup') {
      return NextResponse.redirect(new URL('/pending', req.url));
    }

    // Approved users shouldn't see /pending
    if (token?.approved && path === '/pending') {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow public paths
        if (path === '/login' || path === '/signup' || path.startsWith('/api/auth') || path === '/api/signup') {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|og-image.png|favicon.svg).*)'],
};
