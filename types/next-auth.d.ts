import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      isAdmin: boolean
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    isAdmin?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isAdmin: boolean
  }
}
