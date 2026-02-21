import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'
import { checkRateLimit, getClientIp } from '../../../../lib/security/rate-limit'

const REGISTER_RATE_LIMIT_WINDOW_MS = Number(process.env.AUTH_REGISTER_RATE_LIMIT_WINDOW_MS ?? 60_000)
const REGISTER_RATE_LIMIT_MAX_ATTEMPTS = Number(process.env.AUTH_REGISTER_RATE_LIMIT_MAX_ATTEMPTS ?? 20)

export async function POST(request: Request) {
  try {
    const ipAddress = getClientIp(request)
    const rateLimitKey = `register:${ipAddress}`
    const gate = checkRateLimit(rateLimitKey, {
      windowMs: REGISTER_RATE_LIMIT_WINDOW_MS,
      maxAttempts: REGISTER_RATE_LIMIT_MAX_ATTEMPTS,
    })

    if (!gate.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(gate.retryAfterMs / 1000)),
          },
        }
      )
    }

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
