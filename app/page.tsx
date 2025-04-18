"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Filter, Check, X } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import 'katex/dist/katex.min.css'
import { StructuredData, getEducationalAppStructuredData, getWebsiteStructuredData } from "@/components/seo"
import { AuthCTA } from "@/components/auth-cta"
import { useUserHistory } from "@/context/user-history-context"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"

// Define types for the API responses
interface QuestionAlternative {
  letter: string;
  text: string;
  file?: string;
  isCorrect: boolean;
}

interface Question {
  title: string;
  index: number;
  discipline?: string;
  language?: string;
  year: number;
  context?: string;
  files?: string[];
  correctAlternative: string;
  alternativesIntroduction?: string;
  alternatives: QuestionAlternative[];
}

// Type for tracking user answers
interface UserAnswers {
  [questionId: string]: {
    selectedLetter: string;
    isChecked: boolean;
    isCorrect: boolean;
  };
}

// Component for rendering markdown content with proper styling
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        // Apply className to paragraph elements
        p: ({ node, ...props }) => <p className="prose prose-sm dark:prose-invert max-w-none" {...props} />
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { history, addToHistory } = useUserHistory();
  const { user } = useKindeBrowserClient();

  // Set default years - all years from 2009 to 2023 in descending order
  const defaultYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
  const [availableYears, setAvailableYears] = useState<number[]>(defaultYears);

  // Initialize with the first year in the list
  const [selectedYear, setSelectedYear] = useState<string>(defaultYears[0].toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answerSaving, setAnswerSaving] = useState<{ [key: string]: boolean }>({});

  // Track user answers
  const [userAnswers, setUserAnswers] = useState<UserAnswers>({});

  const questionsPerPage = 10;

  // Fetch available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/exams`);

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        try {
          const data = await response.json();

          // Check if data has the expected structure
          if (data && Array.isArray(data)) {
            // If the API returns an array directly
            const years = data.map((exam: any) => exam.year).filter(Boolean);
            if (years.length > 0) {
              const sortedYears = years.sort((a: number, b: number) => b - a);
              setAvailableYears(sortedYears);
              // Update selectedYear if it's not in the new list
              if (!sortedYears.includes(Number(selectedYear))) {
                setSelectedYear(sortedYears[0].toString());
              }
            }
          } else if (data && data.exams && Array.isArray(data.exams)) {
            // If the API returns an object with exams array
            const years = data.exams.map((exam: any) => exam.year).filter(Boolean);
            if (years.length > 0) {
              const sortedYears = years.sort((a: number, b: number) => b - a);
              setAvailableYears(sortedYears);
              // Update selectedYear if it's not in the new list
              if (!sortedYears.includes(Number(selectedYear))) {
                setSelectedYear(sortedYears[0].toString());
              }
            }
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          // Keep using the default years
        }
      } catch (error) {
        console.error("Failed to fetch years:", error);
        // Keep using the default years
      }
    };

    fetchYears();
  }, [selectedYear, apiBaseUrl]);

  // Fetch questions based on selected year and page
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const offset = (currentPage - 1) * questionsPerPage;
        const apiUrl = `${apiBaseUrl}/exams/${selectedYear}/questions?limit=${questionsPerPage}&offset=${offset}`;

        const response = await fetch(apiUrl);

        // Check if the response is OK
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        try {
          const data = await response.json();

          // Handle different response structures
          if (data && Array.isArray(data)) {
            // If API returns array of questions directly
            setQuestions(data);
            setTotalQuestions(data.length);
          } else if (data && data.questions && Array.isArray(data.questions)) {
            // If API returns object with questions array and metadata
            setQuestions(data.questions);
            setTotalQuestions(data.metadata?.total || data.questions.length);
          } else {
            // Fallback if structure is unexpected
            console.error("Unexpected API response structure:", data);
            setQuestions([]);
            setTotalQuestions(0);
          }
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          setQuestions([]);
          setTotalQuestions(0);
        }
      } catch (error) {
        console.error("Failed to fetch questions:", error);
        setQuestions([]);
        setTotalQuestions(0);
      } finally {
        setLoading(false);
      }
    };

    if (selectedYear) {
      fetchQuestions();
      // Reset user answers when changing page or year
      setUserAnswers({});
    }
  }, [selectedYear, currentPage, apiBaseUrl]);

  // Calculate the total pages
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  // Function to change page
  const changePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, letter: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        selectedLetter: letter,
        isChecked: false,
        isCorrect: false
      }
    }));
  };

  // Check if selected answer is correct
  const checkAnswer = async (questionId: string, correctAlternative: string, question: Question) => {
    if (!userAnswers[questionId]) return;

    const isCorrect = userAnswers[questionId].selectedLetter === correctAlternative;

    setUserAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        isChecked: true,
        isCorrect
      }
    }));

    // Save to history if user is logged in
    if (user) {
      setAnswerSaving(prev => ({ ...prev, [questionId]: true }));

      try {
        await addToHistory({
          questionId,
          year: question.year,
          index: question.index,
          discipline: question.discipline,
          selectedAnswer: userAnswers[questionId].selectedLetter,
          correctAnswer: correctAlternative,
          isCorrect
        });
      } catch (error) {
        console.error("Error saving answer history:", error);
      } finally {
        setAnswerSaving(prev => ({ ...prev, [questionId]: false }));
      }
    }
  };

  // Reset answer for a specific question
  const resetAnswer = (questionId: string) => {
    setUserAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[questionId];
      return newAnswers;
    });
  };

  // Format of questionId: `${year}-${index}`
  const getAnswerHistory = (questionId: string) => {
    return history.find(item => item.questionId === questionId);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Questões do ENEM</h1>
        <p className="text-muted-foreground max-w-3xl mt-2">
          Pratique com questões oficiais do Exame Nacional do Ensino Médio.
        </p>
      </div>

      <AuthCTA />

      <StructuredData data={getEducationalAppStructuredData(appUrl)} id="educational-app-data" />
      <StructuredData data={getWebsiteStructuredData(appUrl)} id="website-data" />

      {/* Filtro por ano */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 p-4 bg-muted rounded-lg">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Filtrar:</span>
        </div>

        <div className="flex-1">
          <Select
            value={selectedYear}
            onValueChange={(value) => {
              setSelectedYear(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Filtrar por ano" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-2 text-xs text-muted-foreground max-w-md mx-auto mb-8">
        <details className="group">
          <summary className="cursor-pointer flex items-center justify-center gap-1 underline-offset-2 decoration-dotted underline hover:text-foreground/90 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-open:rotate-90 transition-transform"><polyline points="9 18 15 12 9 6"></polyline></svg>
            Informações sobre a API e limitações
          </summary>
          <div className="pt-2 pb-1 px-4 mt-1 rounded-md bg-background/50 border text-left">
            <p className="mb-1.5">
              Atualmente a filtragem por disciplina não está disponível devido às limitações da <a href="https://docs.enem.dev/api-reference" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground/80 transition-colors">API do ENEM</a>. Apenas a filtragem por ano é suportada.
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-2 flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              <span>
                <strong>Importante:</strong> Esta aplicação utiliza uma API não-oficial desenvolvida e mantida pela comunidade (<a href="https://enem.dev" target="_blank" rel="noopener noreferrer" className="underline font-medium">enem.dev</a>), sem vínculos com o INEP ou o MEC.
              </span>
            </p>
          </div>
        </details>
      </div>

      {/* Contador de resultados e informação de paginação */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-muted-foreground">
          {totalQuestions} {totalQuestions === 1 ? "questão encontrada" : "questões encontradas"} de {selectedYear}
        </p>
        {totalPages > 1 && (
          <p className="text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Lista de questões */}
      {!loading && (
        <div className="grid gap-6 md:grid-cols-2">
          {questions.length > 0 ? questions.map((question) => {
            const questionId = `${question.year}-${question.index}`;
            const userAnswer = userAnswers[questionId];
            const answerHistory = getAnswerHistory(questionId);
            const isSaving = answerSaving[questionId];

            return (
              <Card key={questionId} className={`h-full ${answerHistory ?
                answerHistory.isCorrect ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{question.discipline || "Disciplina não especificada"}</CardTitle>
                      {answerHistory && (
                        <Badge variant={answerHistory.isCorrect ? "success" : "destructive"} className="text-xs">
                          {answerHistory.isCorrect ? "Acertou" : "Errou"}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {question.year}
                    </Badge>
                  </div>
                  <CardDescription>Questão #{question.index}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  {question.context && (
                    <div className="mb-4 text-sm">
                      <MarkdownContent content={question.context} />
                    </div>
                  )}

                  {question.files && question.files.length > 0 && (
                    <div className="mb-4">
                      {question.files.map((file, i) => (
                        <img key={i} src={file} alt={`Imagem da questão ${question.index}`} className="max-w-full h-auto my-2" />
                      ))}
                    </div>
                  )}

                  {question.alternativesIntroduction && (
                    <div className="mb-2 text-sm font-medium">
                      <MarkdownContent content={question.alternativesIntroduction} />
                    </div>
                  )}

                  <div className="space-y-1">
                    {question.alternatives && question.alternatives.map((alternative) => {
                      // Determine the state of this alternative
                      const isSelected = userAnswer?.selectedLetter === alternative.letter;
                      const isCorrectAfterCheck = userAnswer?.isChecked && alternative.isCorrect;
                      const isIncorrectSelection = userAnswer?.isChecked && isSelected && !alternative.isCorrect;

                      // Highlight if this was the previous answer
                      const isPreviouslyAnswered = answerHistory && alternative.letter === answerHistory.selectedAnswer;
                      const isPreviouslyCorrect = isPreviouslyAnswered && answerHistory.isCorrect;

                      return (
                        <div
                          key={alternative.letter}
                          className={`flex items-start gap-2 p-2 text-sm rounded-md cursor-pointer transition-colors
                            ${isSelected ? 'bg-primary/10' : 'hover:bg-muted'}
                            ${isCorrectAfterCheck ? 'bg-green-100 dark:bg-green-900/30' : ''}
                            ${isIncorrectSelection ? 'bg-red-100 dark:bg-red-900/30' : ''}
                            ${isPreviouslyAnswered && !userAnswer ? (isPreviouslyCorrect ? 'bg-green-50 dark:bg-green-900/10' : 'bg-red-50 dark:bg-red-900/10') : ''}
                          `}
                          onClick={() => !userAnswer?.isChecked && handleAnswerSelect(questionId, alternative.letter)}
                        >
                          <div className={`flex items-center justify-center h-5 w-5 rounded-full border ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                            {isSelected && <span className="text-xs font-bold">✓</span>}
                          </div>
                          <div className="flex-1">
                            <div className="flex">
                              <span className="font-medium w-6 shrink-0">{alternative.letter}) </span>
                              <div className="flex-1">
                                <MarkdownContent content={alternative.text} />
                              </div>
                            </div>
                          </div>
                          {isCorrectAfterCheck && (
                            <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                          )}
                          {isIncorrectSelection && (
                            <X className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                          )}
                          {alternative.file && (
                            <img src={alternative.file} alt={`Imagem da alternativa ${alternative.letter}`} className="max-w-full h-auto mt-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3 gap-2">
                  {userAnswer?.isChecked ? (
                    <>
                      <div className={`text-sm ${userAnswer.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
                        {userAnswer ? 'Clique em verificar para conferir sua resposta' : (
                          answerHistory ? (
                            answerHistory.isCorrect ?
                              'Você acertou esta questão anteriormente' :
                              'Você errou esta questão anteriormente'
                          ) : 'Selecione uma alternativa'
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!userAnswer || isSaving}
                        onClick={() => checkAnswer(questionId, question.correctAlternative, question)}
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full border-2 border-t-transparent border-current animate-spin"></span>
                            Salvando...
                          </span>
                        ) : 'Verificar'}
                      </Button>
                    </>
                  )}
                </CardFooter>
              </Card>
            );
          }) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-muted-foreground">
                Nenhuma questão encontrada para o ano {selectedYear}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center mt-8 gap-2">
          <Button variant="outline" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1} size="sm">
            Anterior
          </Button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            // Lógica para mostrar 5 páginas ao redor da página atual
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => changePage(pageNum)}
                size="sm"
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
            size="sm"
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
