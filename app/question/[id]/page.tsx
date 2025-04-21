import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { StructuredData, getQuestionStructuredData } from '@/components/seo'

// Import the client component
import QuestionClient from './question-client'

// Define types for the API responses
interface QuestionAlternative {
  letter: string
  text: string
  file?: string
  isCorrect: boolean
}

interface Question {
  id: string
  title: string
  index: number
  discipline?: string
  language?: string
  year: number
  context?: string
  files?: string[]
  correctAlternative: string
  alternativesIntroduction?: string
  alternatives: QuestionAlternative[]
}

// Revalidate this page every 24 hours
export const revalidate = 86400

async function getQuestion(year: string, index: string): Promise<Question | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

  try {
    console.log(`Fetching question with year: ${year}, index: ${index}`)

    // Use the correct endpoint structure for individual questions
    const response = await fetch(`${apiBaseUrl}/exams/${year}/questions/${index}`, {
      next: { revalidate },
    })

    if (!response.ok) {
      // If direct endpoint fails, try the list endpoint with filtering as fallback
      console.log(`Direct API call failed, trying list endpoint as fallback...`)
      return await getQuestionFromList(year, index)
    }

    // If direct endpoint succeeds, return the question
    const questionData = await response.json()
    return questionData || null
  } catch (error) {
    console.error('Failed to fetch question:', error)
    // Try fallback method if primary fails
    return await getQuestionFromList(year, index)
  }
}

// Fallback function that uses the list endpoint with filtering
async function getQuestionFromList(year: string, index: string): Promise<Question | null> {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL

  try {
    // Use the list endpoint with query params
    const response = await fetch(`${apiBaseUrl}/exams/${year}/questions?limit=10&offset=0`, {
      next: { revalidate },
    })

    if (!response.ok) {
      console.error(`API error: ${response.status} for year=${year}, index=${index}`)
      return null
    }

    const data = await response.json()

    // Log what we received to help debug
    console.log(
      `API response structure:`,
      Array.isArray(data)
        ? `Array with ${data.length} items`
        : data.questions
          ? `Object with ${data.questions.length} questions`
          : 'Unknown structure'
    )

    let questionData = null

    if (Array.isArray(data)) {
      questionData = data.find((q: { index: number }) => q.index.toString() === index)
    } else if (data.questions && Array.isArray(data.questions)) {
      questionData = data.questions.find((q: { index: number }) => q.index.toString() === index)
    }

    // Try loading multiple pages if needed for higher index numbers
    if (!questionData && data.metadata && data.metadata.total > 10) {
      const totalQuestions = data.metadata.total
      const questionIndex = parseInt(index)

      // Only try loading if the index is within range
      if (questionIndex <= totalQuestions) {
        // Calculate which page the question should be on (0-indexed pages)
        const pageSize = 10
        const targetPage = Math.floor((questionIndex - 1) / pageSize)
        const offset = targetPage * pageSize

        console.log(
          `Question not found in first page. Trying page ${targetPage + 1} with offset ${offset}...`
        )

        const pageResponse = await fetch(
          `${apiBaseUrl}/exams/${year}/questions?limit=${pageSize}&offset=${offset}`,
          {
            next: { revalidate },
          }
        )

        if (pageResponse.ok) {
          const pageData = await pageResponse.json()

          if (Array.isArray(pageData)) {
            questionData = pageData.find((q: { index: number }) => q.index.toString() === index)
          } else if (pageData.questions && Array.isArray(pageData.questions)) {
            questionData = pageData.questions.find(
              (q: { index: number }) => q.index.toString() === index
            )
          }
        }
      }
    }

    if (!questionData) {
      console.log(`No question found for year=${year}, index=${index}`)
    }

    return questionData || null
  } catch (error) {
    console.error('Failed to fetch question with fallback method:', error)
    return null
  }
}

// Create a server component that will fetch the question and render the client component
export default async function QuestionPage({ params }: { params: { id: string } }) {
  // Ensure params is properly awaited before accessing its properties
  const id = await params.id

  // Parse the question ID to extract year and index
  const [year, index] = id.split('-')

  if (!year || !index) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Questão não encontrada</CardTitle>
            <CardDescription>ID de questão inválido: {id}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button variant="outline">Voltar para a página inicial</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const question = await getQuestion(year, index)

  if (!question) {
    // Instead of using notFound(), show a more helpful error message
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Questão não encontrada</CardTitle>
            <CardDescription>
              Não conseguimos encontrar a questão {index} do ano {year}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Esta questão pode não estar disponível na API ou pode haver um erro de indexação.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link href="/">
              <Button variant="outline">Voltar para a página inicial</Button>
            </Link>
            <Link href={`/question/${id}`}>
              <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Tentar novamente
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Add structured data for this specific question
  const questionStructuredData = getQuestionStructuredData({
    id,
    year: parseInt(year),
    index: question.index,
    question: question.title,
    subject: question.discipline,
    correctAnswer: question.correctAlternative,
  })

  return (
    <>
      <StructuredData data={questionStructuredData} id="question-structured-data" />
      <QuestionClient question={question} questionId={id} />
    </>
  )
}
