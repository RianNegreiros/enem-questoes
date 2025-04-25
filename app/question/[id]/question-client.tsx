'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Home,
  Share2,
  BookOpen,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useUserHistory } from '@/context/user-history-context'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { useToast } from '@/components/ui/use-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

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

// Component for rendering markdown content with proper styling
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ node, ...props }: any) => (
          <p className="prose prose-sm dark:prose-invert max-w-none break-words" {...props} />
        ),
        img: ({ node, alt, ...props }: any) => (
          <img
            alt={alt || 'Imagem da questão'}
            className="max-w-full h-auto my-2 rounded-md border"
            loading="lazy"
            {...props}
          />
        ),
        table: ({ node, ...props }: any) => (
          <div className="overflow-x-auto">
            <table
              className="w-full border-collapse border border-gray-300 dark:border-gray-700"
              {...props}
            />
          </div>
        ),
        th: ({ node, ...props }: any) => (
          <th
            className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800"
            {...props}
          />
        ),
        td: ({ node, ...props }: any) => (
          <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function QuestionClient({
  question,
  questionId,
}: {
  question: Question
  questionId: string
}) {
  const router = useRouter()
  const { history, addToHistory } = useUserHistory()
  const { user } = useKindeBrowserClient()
  const { toast } = useToast()

  // Get saved pagination state from localStorage when component mounts
  const [paginationState, setPaginationState] = useState<{
    page?: string
    year?: string
    tab?: string
  }>({})

  useEffect(() => {
    // Try to load pagination state from localStorage
    try {
      const savedState = localStorage.getItem('paginationState')
      if (savedState) {
        setPaginationState(JSON.parse(savedState))
      }
    } catch (error) {
      console.error('Failed to load pagination state from localStorage:', error)
    }
  }, [])

  // Check if user has previously answered this question (only if logged in)
  const previousAnswer = user ? history?.find(h => h.questionId === questionId) : null

  const [selectedLetter, setSelectedLetter] = useState<string | null>(
    previousAnswer ? previousAnswer.selectedAnswer : null
  )
  const [verified, setVerified] = useState(previousAnswer ? true : false)
  const [isCorrect, setIsCorrect] = useState(
    previousAnswer ? previousAnswer.selectedAnswer === question.correctAlternative : false
  )
  const [answerSaving, setAnswerSaving] = useState(false)

  // Reset state when question changes
  useEffect(() => {
    if (previousAnswer) {
      setSelectedLetter(previousAnswer.selectedAnswer)
      setVerified(true)
      setIsCorrect(previousAnswer.selectedAnswer === question.correctAlternative)
    } else {
      setSelectedLetter(null)
      setVerified(false)
      setIsCorrect(false)
    }
  }, [question, previousAnswer])

  // Handle answer selection
  const handleAnswerSelect = (letter: string) => {
    if (!verified) {
      setSelectedLetter(letter)
    }
  }

  // Check if the selected answer is correct
  const verifyAnswer = async () => {
    if (!selectedLetter) return

    const correct = selectedLetter === question.correctAlternative

    setVerified(true)
    setIsCorrect(correct)

    // Save to history if user is logged in
    if (user) {
      setAnswerSaving(true)
      try {
        await addToHistory({
          questionId,
          year: question.year,
          index: question.index,
          discipline: question.discipline,
          selectedAnswer: selectedLetter,
          correctAnswer: question.correctAlternative,
          isCorrect: correct,
        })
      } catch (error) {
        console.error('Failed to save answer to history:', error)
      } finally {
        setAnswerSaving(false)
      }
    } else if (correct) {
      // Show a toast encouraging login for tracking progress
      toast({
        title: 'Resposta correta!',
        description: 'Faça login para salvar seu progresso e acompanhar seu histórico de questões.',
        duration: 5000,
      })
    }
  }

  // Navigate to previous question
  const goToPreviousQuestion = () => {
    const [year, index] = questionId.split('-')
    const prevIndex = Number.parseInt(index) - 1

    if (prevIndex > 0) {
      router.push(`/question/${year}-${prevIndex}`)
    }
  }

  // Navigate to next question
  const goToNextQuestion = () => {
    const [year, index] = questionId.split('-')
    const nextIndex = Number.parseInt(index) + 1

    router.push(`/question/${year}-${nextIndex}`)
  }

  // Share question with Web Share API if available, fallback to clipboard
  const shareQuestion = async () => {
    const url = window.location.href
    const title = `Questão ${question.index} - ENEM ${question.year}`
    const text = `Pratique esta questão do ENEM: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        })
      } catch (error) {
        // Fallback to clipboard if share fails or was cancelled
        copyToClipboard(url)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      copyToClipboard(url)
    }
  }

  // Helper to copy to clipboard with better feedback
  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast({
          title: 'Link copiado!',
          description: 'O link da questão foi copiado para a área de transferência.',
          duration: 3000,
        })
      })
      .catch(() => {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar o link.',
          variant: 'destructive',
          duration: 3000,
        })
      })
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-medium flex items-center">
                <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />
                ENEM {question.year}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2">
                <Link
                  href={`/?${new URLSearchParams({
                    year: paginationState.year || question.year.toString(),
                    page: paginationState.page || '1',
                    tab: paginationState.tab || 'all',
                  }).toString()}`}
                  className="flex items-center text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span>Voltar ao banco de questões</span>
                </Link>
              </div>
            </CardContent>
          </Card>

          {question.discipline && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {question.discipline && (
                    <div className="col-span-2 space-y-1">
                      <span className="text-xs text-muted-foreground">Disciplina</span>
                      <p className="text-sm font-medium">{question.discipline}</p>
                    </div>
                  )}

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Ano</span>
                    <p className="text-sm font-medium">{question.year}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Número</span>
                    <p className="text-sm font-medium">{question.index}</p>
                  </div>

                  {question.language && (
                    <div className="col-span-2 space-y-1">
                      <span className="text-xs text-muted-foreground">Idioma</span>
                      <p className="text-sm font-medium">{question.language}</p>
                    </div>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={shareQuestion}
                  className="w-full flex items-center gap-1 mt-2"
                >
                  <Share2 className="h-4 w-4" />
                  Compartilhar
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-9">
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/40">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                    >
                      Questão {question.index}
                    </Badge>
                    {question.discipline && <Badge variant="outline">{question.discipline}</Badge>}
                    {question.language && <Badge variant="outline">{question.language}</Badge>}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {question.context && (
                <div className="bg-muted/30 p-4 rounded-lg border">
                  <MarkdownContent content={question.context} />
                </div>
              )}

              <div className="text-lg">
                <MarkdownContent content={question.title} />
              </div>

              {question.files && question.files.length > 0 && (
                <div className="space-y-2">
                  {question.files.map((file, idx) => (
                    <div key={idx} className="bg-muted/30 p-2 rounded-lg border">
                      <img
                        src={file || '/placeholder.svg'}
                        alt={`Imagem ${idx + 1} da questão ${question.index}`}
                        className="max-w-full h-auto rounded"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              )}

              {question.alternativesIntroduction && (
                <div>
                  <MarkdownContent content={question.alternativesIntroduction} />
                </div>
              )}

              <Separator className="my-6" />

              <div className="space-y-1 mb-4">
                <h3 className="font-medium text-lg">Alternativas</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione a alternativa que você considera correta
                </p>
              </div>

              {/* Updated alternatives section to match the first code's styling */}
              <div className="space-y-4">
                {question.alternatives.map(alternative => {
                  // Determine the state of this alternative
                  const isSelected = selectedLetter === alternative.letter
                  const isCorrectAfterCheck = verified && alternative.isCorrect
                  const isIncorrectSelection = verified && isSelected && !alternative.isCorrect

                  // Highlight if this was the previous answer
                  const isPreviouslyAnswered =
                    previousAnswer && alternative.letter === previousAnswer.selectedAnswer
                  const isPreviouslyCorrect = isPreviouslyAnswered && previousAnswer.isCorrect

                  return (
                    <div
                      key={alternative.letter}
                      className={`flex items-start gap-3 p-3 text-sm rounded-lg cursor-pointer transition-all
                      ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}
                      ${isCorrectAfterCheck ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : ''}
                      ${isIncorrectSelection ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800' : ''}
                      ${isPreviouslyAnswered && !selectedLetter ? (isPreviouslyCorrect ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900' : 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900') : ''}
                      ${verified ? 'cursor-default' : 'cursor-pointer'}
                    `}
                      onClick={() => !verified && handleAnswerSelect(alternative.letter)}
                    >
                      <div
                        className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5
                        ${isSelected ? 'bg-emerald-500 text-white border-2 border-emerald-500' : 'border-2 border-slate-300 dark:border-slate-600'}
                        ${isCorrectAfterCheck ? 'bg-emerald-500 text-white border-emerald-500' : ''}
                        ${isIncorrectSelection ? 'bg-rose-500 text-white border-rose-500' : ''}
                        `}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        {!isSelected && (
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {alternative.letter}
                          </span>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex">
                          <div className="flex-1">
                            <MarkdownContent content={alternative.text} />
                          </div>
                        </div>

                        {alternative.file && (
                          <img
                            src={alternative.file || '/placeholder.svg'}
                            alt={`Imagem da alternativa ${alternative.letter}`}
                            className="max-w-full h-auto mt-2 rounded-md border"
                            loading="lazy"
                          />
                        )}
                      </div>

                      {isCorrectAfterCheck && (
                        <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                      )}
                      {isIncorrectSelection && <X className="h-5 w-5 text-rose-500 shrink-0" />}
                    </div>
                  )
                })}
              </div>

              {verified && (
                <Alert
                  className={`mt-6 ${
                    isCorrect
                      ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900/50'
                      : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <AlertTitle
                      className={`font-medium ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
                    >
                      {isCorrect ? 'Resposta correta!' : 'Resposta incorreta!'}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="ml-7">
                    {isCorrect
                      ? user
                        ? 'Parabéns! Você acertou a questão.'
                        : 'Parabéns! Você acertou a questão. Faça login para salvar seu progresso.'
                      : `A alternativa correta é: ${question.correctAlternative}`}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex flex-wrap justify-between gap-4 border-t p-6">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={Number.parseInt(questionId.split('-')[1]) <= 1}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              {!verified ? (
                <Button
                  onClick={verifyAnswer}
                  disabled={!selectedLetter || verified || answerSaving}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {answerSaving ? (
                    <span className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-current animate-spin"></span>
                      Salvando...
                    </span>
                  ) : (
                    <>
                      Verificar
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={goToNextQuestion}
                  className={`gap-2 ${isCorrect ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}`}
                >
                  Próxima questão
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
