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

export default function NotFound() {
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Questão não encontrada</CardTitle>
          <CardDescription>A questão solicitada não foi encontrada ou não existe.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Verifique se o ID da questão está correto ou tente acessar outra questão da lista.
          </p>
        </CardContent>
        <CardFooter>
          <Link href="/">
            <Button variant="default">Voltar para a página inicial</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
