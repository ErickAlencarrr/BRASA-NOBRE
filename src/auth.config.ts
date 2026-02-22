import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      
      const isOnLogin = nextUrl.pathname === '/login';
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isApi = nextUrl.pathname.startsWith('/api');
      const isPublic = nextUrl.pathname.startsWith('/_next') || nextUrl.pathname.startsWith('/static');

      // 1. Allow API routes and static assets always (handled by middleware matcher mostly, but good to be explicit)
      if (isApi || isPublic) return true;

      // 2. If trying to access login page
      if (isOnLogin) {
        if (isLoggedIn) {
           // Redirect logged-in users away from login page
           if (userRole === 'ADMIN') {
              return Response.redirect(new URL('/admin', nextUrl));
           }
           // Staff goes to tables (root)
           return Response.redirect(new URL('/', nextUrl));
        }
        return true; // Allow access to login page for unauthenticated users
      }

      // 3. For ALL other routes (root, admin, tables, etc.), require login
      if (!isLoggedIn) {
        return false; // Redirect unauthenticated users to login page
      }

      // 4. Role-based access for authenticated users
      if (isOnAdmin) {
        // Only allow ADMIN to access /admin routes
        if (userRole === 'ADMIN') {
            return true;
        }
        // If logged in but not admin (Staff), redirect to root (Tables)
        return Response.redirect(new URL('/', nextUrl));
      }
      
      // Default: Allow access to other pages (like /) for authenticated users (Staff & Admin)
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
