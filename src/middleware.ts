import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
 
export default NextAuth(authConfig).auth;
 
export const config = {
  // Matcher for all requests except static assets and API routes
  // The middleware will handle redirection for unauthenticated users
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
