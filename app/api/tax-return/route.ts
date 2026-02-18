import { NextResponse } from 'next/server'
import { auth } from '../../../auth'
import prisma from '../../../lib/prisma'

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const taxReturn = await prisma.taxReturn.findUnique({
      where: {
        userId_year: {
          userId: session.user.id,
          year: 2025,
        },
      },
    })

    if (!taxReturn) {
      return NextResponse.json({ data: null })
    }

    return NextResponse.json({ data: JSON.parse(taxReturn.data) })
  } catch (error) {
    console.error('GET tax return error:', error)
    return NextResponse.json({ error: 'Failed to load tax return' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data } = await request.json()

    const taxReturn = await prisma.taxReturn.upsert({
      where: {
        userId_year: {
          userId: session.user.id,
          year: 2025,
        },
      },
      update: {
        data: JSON.stringify(data),
      },
      create: {
        userId: session.user.id,
        year: 2025,
        data: JSON.stringify(data),
      },
    })

    return NextResponse.json({ id: taxReturn.id, updatedAt: taxReturn.updatedAt })
  } catch (error) {
    console.error('PUT tax return error:', error)
    return NextResponse.json({ error: 'Failed to save tax return' }, { status: 500 })
  }
}
