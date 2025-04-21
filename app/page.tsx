'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Info,
  Lightbulb,
  X,
  LockIcon,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import {
  StructuredData,
  getEducationalAppStructuredData,
  getWebsiteStructuredData,
} from '@/components/seo'
import { AuthCTA } from '@/components/auth-cta'
import { useUserHistory } from '@/context/user-history-context'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'

// Define types for the API responses
interface QuestionAlternative {
  letter: string
  text: string
  file?: string
  isCorrect: boolean
}

interface Question {
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

// Type for tracking user answers
interface UserAnswers {
  [questionId: string]: {
    selectedLetter: string
    isChecked: boolean
    isCorrect: boolean
  }
}

// Component for rendering markdown content with proper styling
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ node, ...props }) => (
          <p className="prose prose-sm dark:prose-invert max-w-none break-words" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const { history, addToHistory } = useUserHistory()
  const { user } = useKindeBrowserClient()

  // State for responsive pagination
  const [maxVisiblePages, setMaxVisiblePages] = useState(5)

  // Set default years - all years from 2009 to 2023 in descending order
  const defaultYears = [
    2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009,
  ]
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears)

  // Initialize with the first year in the list
  const [selectedYear, setSelectedYear] = useState<string>(defaultYears[0].toString())
  const [currentPage, setCurrentPage] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [answerSaving, setAnswerSaving] = useState<{ [key: string]: boolean }>({})
  const [activeTab, setActiveTab] = useState('all')

  // Track user answers
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({})

  const questionsPerPage = 10

  // Update max visible pages based on screen size
  useEffect(() => {
    const handleResize = () => {
      setMaxVisiblePages(window.innerWidth < 640 ? 3 : 5)
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/exams`)

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        try {
          const data = await response.json()

          // Check if data has the expected structure
          if (data && Array.isArray(data)) {
            // If the API returns an array directly
            const years = data.map((exam: any) => exam.year).filter(Boolean)
            if (years.length > 0) {
              const sortedYears = years.sort((a: number, b: number) => b - a)
              setAvailableYears(sortedYears)
              // Update selectedYear if it's not in the new list
              if (!sortedYears.includes(Number(selectedYear))) {
                setSelectedYear(sortedYears[0].toString())
              }
            }
          } else if (data && data.exams && Array.isArray(data.exams)) {
            // If the API returns an object with exams array
            const years = data.exams.map((exam: any) => exam.year).filter(Boolean)
            if (years.length > 0) {
              const sortedYears = years.sort((a: number, b: number) => b - a)
              setAvailableYears(sortedYears)
              // Update selectedYear if it's not in the new list
              if (!sortedYears.includes(Number(selectedYear))) {
                setSelectedYear(sortedYears[0].toString())
              }
            }
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error)
          // Keep using the default years
        }
      } catch (error) {
        console.error('Failed to fetch years:', error)
        // Keep using the default years
      }
    }

    fetchYears()
  }, [selectedYear, apiBaseUrl])

  // Fetch questions based on selected year and page
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      try {
        const offset = (currentPage - 1) * questionsPerPage
        const apiUrl = `${apiBaseUrl}/exams/${selectedYear}/questions?limit=${questionsPerPage}&offset=${offset}`

        const response = await fetch(apiUrl, {
          // Next.js 15 cache strategy
          next: { revalidate: 3600 }, // Cache for 1 hour
        })

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        try {
          const data = await response.json()

          // Handle different response structures
          if (data && Array.isArray(data)) {
            // If API returns array of questions directly
            setQuestions(data)
            setTotalQuestions(data.length)
          } else if (data && data.questions && Array.isArray(data.questions)) {
            // If API returns object with questions array and metadata
            setQuestions(data.questions)
            setTotalQuestions(data.metadata?.total || data.questions.length)
          } else {
            // Fallback if structure is unexpected
            console.error('Unexpected API response structure:', data)
            setQuestions([])
            setTotalQuestions(0)
          }
        } catch (error) {
          console.error('Failed to parse JSON:', error)
          setQuestions([])
          setTotalQuestions(0)
        }
      } catch (error) {
        console.error('Failed to fetch questions:', error)
        setQuestions([])
        setTotalQuestions(0)
      } finally {
        setLoading(false)
      }
    }

    if (selectedYear) {
      fetchQuestions()
      // Reset user answers when changing page or year
      setUserAnswers({})
    }
  }, [selectedYear, currentPage, apiBaseUrl])

  // Calculate the total pages
  const totalPages = Math.ceil(totalQuestions / questionsPerPage)

  // Function to change page
  const changePage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    // If we're on a filtered tab and changing pages, reset to 'all' to avoid confusion
    if (activeTab !== 'all') {
      setActiveTab('all')
    }
  }

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, letter: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedLetter: letter,
        isChecked: false,
        isCorrect: false,
      },
    }))
  }

  // Check if selected answer is correct
  const checkAnswer = async (
    questionId: string,
    correctAlternative: string,
    question: Question
  ) => {
    if (!userAnswers[questionId]) return

    const isCorrect = userAnswers[questionId].selectedLetter === correctAlternative

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isChecked: true,
        isCorrect,
      },
    }))

    // Save to history if user is logged in
    if (user) {
      setAnswerSaving(prev => ({ ...prev, [questionId]: true }))

      try {
        await addToHistory({
          questionId,
          year: question.year,
          index: question.index,
          discipline: question.discipline,
          selectedAnswer: userAnswers[questionId].selectedLetter,
          correctAnswer: correctAlternative,
          isCorrect,
        })
      } catch (error) {
        console.error('Error saving answer history:', error)
      } finally {
        setAnswerSaving(prev => ({ ...prev, [questionId]: false }))
      }
    }
  }

  // Reset answer for a specific question
  const resetAnswer = (questionId: string) => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev }
      delete newAnswers[questionId]
      return newAnswers
    })
  }

  // Format of questionId: `${year}-${index}`
  const getAnswerHistory = (questionId: string) => {
    return history.find(item => item.questionId === questionId)
  }

  // Check if a question is in history
  const isInHistory = (questionId: string) => {
    return history.some(item => item.questionId === questionId)
  }

  // Filter questions based on active tab
  const filteredQuestions = questions.filter(question => {
    const questionId = `${question.year}-${question.index}`

    // Use direct checks instead of getAnswerHistory for clarity and to avoid potential issues
    if (activeTab === 'all') return true

    // For unanswered, simply check if the question is not in history
    if (activeTab === 'unanswered') {
      return !isInHistory(questionId)
    }

    // For the other tabs, we need to find the history item
    const historyItem = history.find(item => item.questionId === questionId)

    if (activeTab === 'correct' && historyItem?.isCorrect) return true
    if (activeTab === 'incorrect' && historyItem && !historyItem.isCorrect) return true

    return false
  })

  // Check if all questions on current page are answered
  useEffect(() => {
    // Only run this if we're on the unanswered tab, not loading,
    // have questions available, but no filtered questions
    if (
      activeTab === 'unanswered' &&
      !loading &&
      questions.length > 0 &&
      filteredQuestions.length === 0 &&
      currentPage < totalPages
    ) {
      // All questions on this page are answered, automatically go to next page
      console.log('All questions on this page are answered, loading next page...')
      changePage(currentPage + 1)
    }
  }, [activeTab, loading, questions, filteredQuestions, currentPage, totalPages])

  // Debug logging
  useEffect(() => {
    if (activeTab === 'unanswered') {
      console.log('Debug info:')
      console.log('- Active tab:', activeTab)
      console.log('- User logged in:', !!user)
      console.log('- History items:', history.length)
      console.log('- Total questions:', questions.length)
      console.log('- Filtered questions:', filteredQuestions.length)
      console.log('- Current page:', currentPage, 'of', totalPages)

      // Log the first few questions and their status
      if (questions.length > 0) {
        questions.slice(0, 3).forEach(q => {
          const qId = `${q.year}-${q.index}`
          const history_item = history.find(h => h.questionId === qId)
          console.log(`- Question ${qId} in history:`, !!history_item)
        })
      }
    }
  }, [activeTab, questions, filteredQuestions, history, user, currentPage, totalPages])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Questões do ENEM
            </h1>
            <p className="text-muted-foreground max-w-3xl mx-auto mt-3">
              Pratique com questões oficiais do Exame Nacional do Ensino Médio
            </p>
          </div>

          <AuthCTA />

          <StructuredData
            data={getEducationalAppStructuredData(appUrl)}
            id="educational-app-data"
          />
          <StructuredData data={getWebsiteStructuredData(appUrl)} id="website-data" />

          {/* Filter and info section */}
          <div className="mb-8 rounded-xl bg-white dark:bg-slate-900 shadow-sm border p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1 space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Filter className="h-5 w-5 text-emerald-500" />
                  Filtrar questões
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      Ano do exame
                    </label>
                    <Select
                      value={selectedYear}
                      onValueChange={value => {
                        setSelectedYear(value)
                        setCurrentPage(1)
                        setActiveTab('all') // Reset tab when changing year
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <SelectValue placeholder="Filtrar por ano" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {availableYears.map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto md:min-w-[280px] bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <h3 className="font-medium">Sobre a API</h3>
                    <p className="text-muted-foreground">
                      Esta aplicação utiliza a API não-oficial do ENEM desenvolvida pela comunidade
                      <a
                        href="https://enem.dev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline mx-1 font-medium"
                      >
                        enem.dev
                      </a>
                      sem vínculos com o INEP ou MEC.
                    </p>
                    <a
                      href="https://docs.enem.dev/api-reference"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      Ver documentação da API
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and tabs */}
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg shadow-sm border">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">
                {totalQuestions}{' '}
                {totalQuestions === 1 ? 'questão encontrada' : 'questões encontradas'} de{' '}
                {selectedYear}
              </span>
              {totalPages > 1 && (
                <span className="text-xs text-muted-foreground ml-1">
                  (Página {currentPage} de {totalPages})
                </span>
              )}
            </div>

            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={value => {
                // Only allow changing to correct/incorrect tabs if logged in
                if (!user && (value === 'correct' || value === 'incorrect')) {
                  return
                }
                setActiveTab(value)
              }}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                <TabsTrigger value="all">Todas</TabsTrigger>
                <TabsTrigger
                  value="correct"
                  disabled={!user}
                  className={!user ? 'opacity-50 cursor-not-allowed relative group' : ''}
                  title={!user ? 'Faça login para ver suas questões acertadas' : ''}
                >
                  Acertadas
                  {!user && (
                    <>
                      <LockIcon className="w-3 h-3 ml-1 inline-block" />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 px-2 py-1.5 bg-black bg-opacity-80 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        Faça login para ver suas questões acertadas
                      </div>
                    </>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="incorrect"
                  disabled={!user}
                  className={!user ? 'opacity-50 cursor-not-allowed relative group' : ''}
                  title={!user ? 'Faça login para ver suas questões erradas' : ''}
                >
                  Erradas
                  {!user && (
                    <>
                      <LockIcon className="w-3 h-3 ml-1 inline-block" />
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 px-2 py-1.5 bg-black bg-opacity-80 text-white text-xs rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                        Faça login para ver suas questões erradas
                      </div>
                    </>
                  )}
                </TabsTrigger>
                <TabsTrigger value="unanswered">Não respondidas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col justify-center items-center h-64 bg-white dark:bg-slate-900 rounded-xl shadow-sm border p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
              <p className="text-muted-foreground">Carregando questões...</p>
            </div>
          )}

          {/* Questions list */}
          {!loading && (
            <>
              {filteredQuestions.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                  {filteredQuestions.map((question, idx) => {
                    const questionId = `${question.year}-${question.index}`
                    const userAnswer = userAnswers[questionId]
                    const answerHistory = getAnswerHistory(questionId)
                    const isSaving = answerSaving[questionId]

                    let statusColor = ''
                    if (answerHistory) {
                      statusColor = answerHistory.isCorrect
                        ? 'border-l-4 border-l-emerald-500'
                        : 'border-l-4 border-l-rose-500'
                    }

                    return (
                      <Card
                        key={idx}
                        className={`h-full overflow-hidden transition-all duration-200 hover:shadow-md ${statusColor}`}
                      >
                        <CardHeader className="pb-2 bg-slate-50 dark:bg-slate-800/50">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <CardTitle className="text-lg">
                                {question.discipline || 'Disciplina não especificada'}
                              </CardTitle>
                              {answerHistory && (
                                <Badge
                                  variant={answerHistory.isCorrect ? 'default' : 'destructive'}
                                  className={
                                    answerHistory.isCorrect ? 'bg-green-500 text-white' : ''
                                  }
                                >
                                  {answerHistory.isCorrect ? 'Acertou' : 'Errou'}
                                </Badge>
                              )}
                            </div>
                            <Badge variant="outline" className="flex items-center gap-1 self-start">
                              <Calendar className="h-3 w-3" />
                              {question.year}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <span>Questão #{question.index}</span>
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="pt-4 pb-2">
                          {question.context && (
                            <div className="mb-4 text-sm bg-slate-50/50 dark:bg-slate-800/20 p-3 rounded-lg">
                              <MarkdownContent content={question.context} />
                            </div>
                          )}

                          {question.files && question.files.length > 0 && (
                            <div className="mb-4 overflow-x-auto">
                              {question.files.map((file, i) => (
                                <img
                                  key={i}
                                  src={file || '/placeholder.svg'}
                                  alt={`Imagem da questão ${question.index}`}
                                  className="max-w-full h-auto my-2 rounded-md border"
                                  loading="lazy"
                                />
                              ))}
                            </div>
                          )}

                          {question.alternativesIntroduction && (
                            <div className="mb-3 text-sm font-medium">
                              <MarkdownContent content={question.alternativesIntroduction} />
                            </div>
                          )}

                          <div className="space-y-2 mt-4">
                            {question.alternatives &&
                              question.alternatives.map(alternative => {
                                // Determine the state of this alternative
                                const isSelected = userAnswer?.selectedLetter === alternative.letter
                                const isCorrectAfterCheck =
                                  userAnswer?.isChecked && alternative.isCorrect
                                const isIncorrectSelection =
                                  userAnswer?.isChecked && isSelected && !alternative.isCorrect

                                // Highlight if this was the previous answer
                                const isPreviouslyAnswered =
                                  answerHistory &&
                                  alternative.letter === answerHistory.selectedAnswer
                                const isPreviouslyCorrect =
                                  isPreviouslyAnswered && answerHistory.isCorrect

                                return (
                                  <div
                                    key={alternative.letter}
                                    className={`flex items-start gap-3 p-3 text-sm rounded-lg cursor-pointer transition-all
                                    ${isSelected ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'}
                                    ${isCorrectAfterCheck ? 'bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800' : ''}
                                    ${isIncorrectSelection ? 'bg-rose-50 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-800' : ''}
                                    ${isPreviouslyAnswered && !userAnswer ? (isPreviouslyCorrect ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900' : 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900') : ''}
                                  `}
                                    onClick={() =>
                                      !userAnswer?.isChecked &&
                                      handleAnswerSelect(questionId, alternative.letter)
                                    }
                                  >
                                    <div
                                      className={`flex items-center justify-center h-6 w-6 rounded-full shrink-0 mt-0.5
                                      ${
                                        isSelected
                                          ? 'bg-emerald-500 text-white border-2 border-emerald-500'
                                          : 'border-2 border-slate-300 dark:border-slate-600'
                                      }
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
                                    {isIncorrectSelection && (
                                      <X className="h-5 w-5 text-rose-500 shrink-0" />
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        </CardContent>

                        <Separator />

                        <CardFooter className="flex flex-col sm:flex-row justify-between pt-4 gap-3">
                          {userAnswer?.isChecked ? (
                            <>
                              <div
                                className={`text-sm font-medium ${userAnswer.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}
                              >
                                {userAnswer.isCorrect
                                  ? 'Resposta correta!'
                                  : `Resposta incorreta. Correta: ${question.correctAlternative}`}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resetAnswer(questionId)}
                              >
                                Tentar novamente
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="text-xs text-muted-foreground">
                                {userAnswer
                                  ? 'Clique em verificar para conferir sua resposta'
                                  : answerHistory
                                    ? answerHistory.isCorrect
                                      ? 'Você acertou esta questão anteriormente'
                                      : 'Você errou esta questão anteriormente'
                                    : 'Selecione uma alternativa'}
                              </div>
                              <Button
                                variant="default"
                                size="sm"
                                disabled={!userAnswer || isSaving}
                                onClick={() =>
                                  checkAnswer(questionId, question.correctAlternative, question)
                                }
                                className="mt-2 sm:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white"
                              >
                                {isSaving ? (
                                  <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-current animate-spin"></span>
                                    Salvando...
                                  </span>
                                ) : (
                                  'Verificar'
                                )}
                              </Button>
                            </>
                          )}

                          <Link
                            href={`/question/${questionId}`}
                            className="w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto"
                          >
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-emerald-700 dark:text-emerald-500 w-full"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
                  <div className="max-w-md mx-auto">
                    <h3 className="text-lg font-medium mb-2">Nenhuma questão encontrada</h3>
                    <p className="text-muted-foreground mb-6">
                      {activeTab === 'all'
                        ? `Nenhuma questão encontrada para o ano ${selectedYear}.`
                        : activeTab === 'unanswered'
                          ? currentPage >= totalPages
                            ? `Todas as questões do ano ${selectedYear} já foram respondidas. Tente outro ano.`
                            : `Buscando mais questões não respondidas...`
                          : `Não há questões ${activeTab === 'correct' ? 'acertadas' : 'erradas'} para o ano ${selectedYear}.`}
                    </p>
                    {activeTab !== 'all' &&
                      !(activeTab === 'unanswered' && currentPage < totalPages) && (
                        <Button variant="outline" onClick={() => setActiveTab('all')}>
                          Ver todas as questões
                        </Button>
                      )}
                    {activeTab === 'unanswered' && currentPage < totalPages && (
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && filteredQuestions.length > 0 && (
            <div className="flex flex-wrap justify-center mt-8 gap-2">
              <Button
                variant="outline"
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                size="sm"
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>

              {Array.from({ length: Math.min(maxVisiblePages, totalPages) }, (_, i) => {
                // Logic to show pages around the current page
                let pageNum

                if (totalPages <= maxVisiblePages) {
                  pageNum = i + 1
                } else if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - Math.floor(maxVisiblePages / 2)) {
                  pageNum = totalPages - (maxVisiblePages - 1) + i
                } else {
                  pageNum = currentPage - Math.floor(maxVisiblePages / 2) + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    onClick={() => changePage(pageNum)}
                    size="sm"
                    className={currentPage === pageNum ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                  >
                    {pageNum}
                  </Button>
                )
              })}

              <Button
                variant="outline"
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                size="sm"
                className="flex items-center gap-1"
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
