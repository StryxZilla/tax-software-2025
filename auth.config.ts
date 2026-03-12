import type { NextAuthConfig } from 'next-auth'

const nextAuthSecret = process.env.NEXTAUTH_SECRET ?? (process.env.NODE_ENV !== 'production' ? 'dev-insecure-secret-change-me' : undefined)

if (!nextAuthSecret) {
  throw new Error('NEXTAUTH_SECRET is required in production.')
}

// Edge-compatible auth config (no Node.js APIs, no prisma)
// Used by middleware for JWT token verification only
export const authConfig: NextAuthConfig = {
  providers: [],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isAdmin = (user as { isAdmin?: boolean }).isAdmin ?? false
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
  secret: nextAuthSecret,
}
