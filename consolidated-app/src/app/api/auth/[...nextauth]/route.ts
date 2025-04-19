import NextAuth from 'next-auth';
import { authOptions } from './authOptions';

// Extend the built-in session types
declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };