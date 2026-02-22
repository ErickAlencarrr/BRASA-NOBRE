import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      
      if (isOnAdmin) {
        if (isLoggedIn) {
            // Only allow ADMIN to access /admin routes
            if (userRole === 'ADMIN') {
                return true;
            }
            // If logged in but not admin, redirect to root (Staff should see tables)
            return Response.redirect(new URL('/', nextUrl));
        }
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
         // Redirect logged-in users away from login page
         if (userRole === 'ADMIN') {
            return Response.redirect(new URL('/admin', nextUrl));
         }
         return Response.redirect(new URL('/', nextUrl));
      }
      
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
