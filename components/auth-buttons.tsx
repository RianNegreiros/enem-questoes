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
import { History, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

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
  const { setTheme } = useTheme()

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
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          <span>Tema Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2">
          <Moon className="h-4 w-4" />
          <span>Tema Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <LogoutLink>Sair</LogoutLink>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
