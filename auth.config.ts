import type { NextAuthConfig } from 'next-auth'

const nextAuthSecret = process.env.NEXTAUTH_SECRET

if (!nextAuthSecret && process.env.NODE_ENV !== 'development') {
  throw new Error('NEXTAUTH_SECRET is required when NODE_ENV is not development.')
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
