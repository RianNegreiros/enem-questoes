import { PrismaClient } from '@prisma/client'
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

// Inicializar cliente Prisma diretamente aqui em vez de importar
const prisma = new PrismaClient()

// POST - Add a new answer to user's history
export async function POST(req: NextRequest) {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user || !user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { questionId, year, index, discipline, selectedAnswer, correctAnswer, isCorrect } =
      await req.json()

    // Make sure the required fields are provided
    if (
      !questionId ||
      !selectedAnswer ||
      !correctAnswer ||
      typeof isCorrect !== 'boolean' ||
      !year ||
      !index
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user exists, if not create a new user record
    await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        givenName: user.given_name,
        familyName: user.family_name,
        picture: user.picture,
      },
    })

    // Create or update answer history
    const result = await prisma.answerHistory.upsert({
      where: {
        userId_questionId: {
          userId: user.id,
          questionId: questionId,
        },
      },
      update: {
        selectedAnswer,
        correctAnswer,
        isCorrect,
        answeredAt: new Date(),
      },
      create: {
        questionId,
        year,
        index,
        discipline,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        userId: user.id,
      },
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error adding to history:', error)
    return NextResponse.json({ error: 'Failed to add to history' }, { status: 500 })
  }
}
