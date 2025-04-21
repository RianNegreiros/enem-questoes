'use client'

import { useEffect } from 'react'
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

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to monitoring service
    console.error('Question page error:', error)
  }, [error])

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Algo deu errado</CardTitle>
          <CardDescription>Ocorreu um erro ao tentar carregar a questão.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Tente novamente ou volte para a página inicial.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="p-4 bg-destructive/10 rounded-md text-destructive text-sm my-4">
              <p className="font-semibold">Erro (apenas visível em ambiente de desenvolvimento):</p>
              <p className="font-mono mt-2">{error.message}</p>
              {error.digest && <p className="font-mono text-xs mt-2">Digest: {error.digest}</p>}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button onClick={reset} variant="default">
            Tentar novamente
          </Button>
          <Link href="/">
            <Button variant="outline">Voltar para a página inicial</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
