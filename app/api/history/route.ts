import { PrismaClient } from '@prisma/client'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Inicializar cliente Prisma diretamente aqui em vez de importar
const prisma = new PrismaClient()

// GET - Retrieve user's answer history
export async function GET(req: NextRequest) {
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
export async function DELETE(req: NextRequest) {
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
