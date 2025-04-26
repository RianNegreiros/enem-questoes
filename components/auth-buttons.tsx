'use client'

import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  useKindeBrowserClient,
} from '@kinde-oss/kinde-auth-nextjs'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar } from '@/components/ui/avatar'
import Link from 'next/link'
import { History } from 'lucide-react'

interface AuthButtonProps {
  className?: string
}

export function LoginButton({ className }: AuthButtonProps) {
  return (
    <LoginLink>
      <Button variant="outline" className={className}>
        Entrar
      </Button>
    </LoginLink>
  )
}

export function RegisterButton({ className }: AuthButtonProps) {
  return (
    <RegisterLink>
      <Button className={className}>Cadastrar</Button>
    </RegisterLink>
  )
}

export function UserButton() {
  const { user, isLoading } = useKindeBrowserClient()

  if (isLoading || !user) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar
            src={user.picture ?? ''}
            name={user.given_name?.[0] || user.family_name?.[0] || ''}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.email || user.given_name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <LogoutLink>Sair</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
