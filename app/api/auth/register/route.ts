import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, name, password } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    const userCount = await prisma.user.count()
    const isAdmin = userCount === 0

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        isAdmin,
      },
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Registration error:', error)
    }

    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
