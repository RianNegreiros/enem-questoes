"use client";

import { useUserHistory } from "@/context/user-history-context";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle, XCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterType = "all" | "correct" | "incorrect";

export default function HistoryPage() {
  const { user, isLoading: isUserLoading } = useKindeBrowserClient();
  const { history, clearHistory } = useUserHistory();
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  // Apply filter to history
  const filteredHistory = history.filter(item => {
    if (filter === "all") return true;
    if (filter === "correct") return item.isCorrect;
    if (filter === "incorrect") return !item.isCorrect;
    return true;
  });

  // Group history by year
  const groupedByYear = filteredHistory.reduce<Record<number, typeof filteredHistory>>((acc, item) => {
    if (!acc[item.year]) {
      acc[item.year] = [];
    }
    acc[item.year].push(item);
    return acc;
  }, {});

  // Sort years in descending order
  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Get stats
  const totalAnswered = history.length;
  const correctAnswers = history.filter(item => item.isCorrect).length;
  const incorrectAnswers = history.filter(item => !item.isCorrect).length;
  const correctPercentage = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;

  if (isUserLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar conectado para ver seu histórico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Faça login para acessar seu histórico de questões respondidas.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/">Voltar para a página inicial</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Respostas</h1>
          <p className="text-muted-foreground max-w-3xl mt-2">
            Acompanhe as questões que você já respondeu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {history.length > 0 && (
            <>
              <div className="w-full sm:w-48">
                <Select
                  value={filter}
                  onValueChange={(value) => setFilter(value as FilterType)}
                >
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar respostas" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as respostas</SelectItem>
                    <SelectItem value="correct">Respostas corretas</SelectItem>
                    <SelectItem value="incorrect">Respostas incorretas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isConfirmingClear ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsConfirmingClear(false)}>
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    clearHistory();
                    setIsConfirmingClear(false);
                  }}>
                    Confirmar Exclusão
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsConfirmingClear(true)}>
                  Limpar Histórico
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">
                Você ainda não respondeu nenhuma questão.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/">Praticar Questões</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-1">Total de questões</p>
                  <p className="text-3xl font-bold">{totalAnswered}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-1">Respostas corretas</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {correctAnswers} <span className="text-sm">({correctPercentage}%)</span>
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-1">Respostas incorretas</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {incorrectAnswers} <span className="text-sm">({100 - correctPercentage}%)</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {filteredHistory.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Nenhuma resposta encontrada com o filtro atual.
                  </p>
                  <Button className="mt-4" variant="outline" onClick={() => setFilter("all")}>
                    Mostrar todas as respostas
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {years.map(year => (
                <div key={year}>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Provas de {year}
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {groupedByYear[year]
                      .sort((a, b) => new Date(b.answeredAt).getTime() - new Date(a.answeredAt).getTime())
                      .map(item => (
                        <Card key={item.questionId} className={`border-l-4 ${item.isCorrect
                          ? 'border-l-green-500'
                          : 'border-l-red-500'
                          }`}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base">
                                Questão #{item.index}
                              </CardTitle>
                              <Badge variant="outline">
                                {item.discipline || "Disciplina não especificada"}
                              </Badge>
                            </div>
                            <CardDescription>
                              Respondida em {new Date(item.answeredAt).toLocaleDateString('pt-BR')}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Sua resposta:</span>
                              <Badge variant="outline">{item.selectedAnswer}</Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Resposta correta:</span>
                              <Badge variant="outline">{item.correctAnswer}</Badge>
                            </div>
                          </CardContent>
                          <CardFooter className="border-t pt-3">
                            <div className="flex items-center gap-2 text-sm">
                              {item.isCorrect ? (
                                <>
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                  <span className="text-green-600 dark:text-green-400">Resposta correta</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-4 w-4 text-red-500" />
                                  <span className="text-red-600 dark:text-red-400">Resposta incorreta</span>
                                </>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
} 