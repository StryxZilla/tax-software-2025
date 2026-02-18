import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'

export async function POST(request: Request) {
  try {
    console.log('Register API called')
    const { email, name, password } = await request.json()
    console.log('Received:', { email, name })

    if (!email || !password || !name) {
      console.log('Missing required fields')
      return NextResponse.json(
        { error: 'Email, name, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      console.log('Password too short')
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    console.log('Checking for existing user')
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      console.log('User exists:', email)
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    console.log('Getting user count')
    const userCount = await prisma.user.count()
    const isAdmin = userCount === 0

    console.log('Hashing password')
    const passwordHash = await bcrypt.hash(password, 12)

    console.log('Creating user')
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        isAdmin,
      },
    })

    console.log('User created:', user.id)
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}