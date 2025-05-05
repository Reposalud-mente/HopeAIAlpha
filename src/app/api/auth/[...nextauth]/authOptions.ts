import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { AuthOptions } from 'next-auth';
import { trackEvent, EventType } from '@/lib/monitoring';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        remember: { label: "Remember", type: "boolean" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          trackEvent({
            type: EventType.USER_ACTION,
            name: 'login_attempt_failed',
            data: { reason: 'missing_credentials' }
          });
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          console.log("User not found");
          trackEvent({
            type: EventType.USER_ACTION,
            name: 'login_attempt_failed',
            data: { reason: 'user_not_found', email: credentials.email }
          });
          return null;
        }

        if (!user.passwordHash) {
          console.log("User has no password hash");
          trackEvent({
            type: EventType.USER_ACTION,
            name: 'login_attempt_failed',
            data: { reason: 'no_password_hash', userId: user.id }
          });
          return null;
        }

        try {
          const isPasswordValid = await compare(credentials.password, user.passwordHash);

          if (!isPasswordValid) {
            console.log("Invalid password");
            trackEvent({
              type: EventType.USER_ACTION,
              name: 'login_attempt_failed',
              data: { reason: 'invalid_password', userId: user.id }
            });
            return null;
          }

          // Track successful login
          trackEvent({
            type: EventType.USER_ACTION,
            name: 'login_success',
            data: { 
              userId: user.id,
              rememberMe: credentials.remember === 'true'
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role
          };
        } catch (error) {
          console.error("Error comparing passwords:", error);
          trackEvent({
            type: EventType.ERROR,
            name: 'login_error',
            data: { 
              userId: user.id,
              error: error instanceof Error ? error.message : 'Unknown error'
            }
          });
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login?error=AuthenticationError'
  },
  session: {
    strategy: "jwt",
    // Set session max age based on "remember me" option
    maxAge: 30 * 24 * 60 * 60, // 30 days by default
  },
  callbacks: {
    async jwt({ token, user, trigger, session, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        
        // Check if remember me was selected
        if (account && account.type === 'credentials') {
          // Store the remember me preference in the token
          token.remember = account.remember === 'true';
        }
      }
      
      // Update session when it changes
      if (trigger === 'update' && session) {
        if (session.user) {
          token.name = session.user.name;
          token.email = session.user.email;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
