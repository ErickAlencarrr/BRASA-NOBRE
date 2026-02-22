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

      // 1. Allow API routes and static assets
      if (isApi || isPublic) return true;

      // 2. If trying to access login page
      if (isOnLogin) {
        if (isLoggedIn) {
           // Redirect logged-in users away from login page
           if (userRole === 'ADMIN') {
              return Response.redirect(new URL('/admin', nextUrl));
           }
           // Staff goes to tables
           return Response.redirect(new URL('/mesas', nextUrl));
        }
        return true; 
      }

      // 3. Require login for everything else
      if (!isLoggedIn) {
        return false;
      }

      // 4. Role-based access
      if (isOnAdmin) {
        if (userRole === 'ADMIN') {
            return true;
        }
        return Response.redirect(new URL('/mesas', nextUrl));
      }
      
      // 5. Restrict Products to Admin
      if (nextUrl.pathname.startsWith('/produtos')) {
        if (userRole !== 'ADMIN') {
           return Response.redirect(new URL('/mesas', nextUrl));
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;
