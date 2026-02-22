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

      // 2. Login Page Logic
      if (isOnLogin) {
        if (isLoggedIn) {
           if (userRole === 'ADMIN') return Response.redirect(new URL('/admin', nextUrl));
           if (userRole === 'COZINHA') return Response.redirect(new URL('/cozinha', nextUrl));
           // Staff goes to mesas
           return Response.redirect(new URL('/mesas', nextUrl));
        }
        return true; 
      }

      // 3. Require login for everything else
      if (!isLoggedIn) {
        return false;
      }

      // 4. Role Access Control
      if (isOnAdmin) {
        if (userRole === 'ADMIN') return true;
        // Redirect unauthorized access to their home
        if (userRole === 'COZINHA') return Response.redirect(new URL('/cozinha', nextUrl));
        return Response.redirect(new URL('/mesas', nextUrl));
      }
      
      // Cozinha/Mesas/Produtos are allowed for authenticated users generally, 
      // but specific page logic might hide buttons.
      // We assume Staff/Admin can see Cozinha/Produtos.
      // Cozinha role might be restricted from Mesas? 
      // For now, let's allow navigation but redirect root based on role.
      
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
