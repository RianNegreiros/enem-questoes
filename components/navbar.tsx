'use client'

import Link from 'next/link'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { LoginButton, RegisterButton, UserButton } from './auth-buttons'
import { ThemeToggle } from './theme-toggle'
import { useState, useEffect } from 'react'
import { BookOpen, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'

export function Navbar() {
  const { user, isLoading } = useKindeBrowserClient()
  const [isScrolled, setIsScrolled] = useState(false)

  // Add scroll detection for enhanced visual effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-200',
        isScrolled && 'shadow-sm'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center font-bold text-lg ml-2">
            <span>ENEM Questões</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
              Início
            </Link>
            {user && (
              <Link
                href="/history"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Histórico
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? null : user ? (
              <UserButton />
            ) : (
              <>
                <LoginButton />
                <RegisterButton />
              </>
            )}
          </div>

          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-bold">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span>ENEM Questões</span>
                  </Link>
                </div>

                <nav className="flex flex-col gap-4 py-6 flex-1">
                  <Link
                    href="/"
                    className="flex items-center text-sm font-medium transition-colors hover:text-primary py-2"
                  >
                    Início
                  </Link>
                  {user && (
                    <Link
                      href="/history"
                      className="flex items-center text-sm font-medium transition-colors hover:text-primary py-2"
                    >
                      Histórico
                    </Link>
                  )}
                </nav>

                <div className="border-t pt-4">
                  {!isLoading && !user && (
                    <div className="flex flex-col gap-2">
                      <LoginButton className="w-full" />
                      <RegisterButton className="w-full" />
                    </div>
                  )}
                  {user && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                      <UserButton />
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
