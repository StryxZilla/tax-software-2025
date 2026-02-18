import type { NextAuthConfig } from 'next-auth'

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
  secret: process.env.NEXTAUTH_SECRET || 'taxflow-2025-secret-key-change-in-prod-xK9mP2nQ',
}
