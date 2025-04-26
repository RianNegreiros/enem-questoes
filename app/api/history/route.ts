import { PrismaClient } from '@prisma/client'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

// GET - Retrieve user's answer history
export async function GET() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const history = await prisma.answerHistory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        answeredAt: 'desc',
      },
    })

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching history:', error)
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 })
  }
}

// DELETE - Clear user's answer history
export async function DELETE() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.answerHistory.deleteMany({
      where: {
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing history:', error)
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 })
  }
}
