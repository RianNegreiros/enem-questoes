'use client'

import Link from 'next/link'
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs'
import { LoginButton, RegisterButton, UserButton } from './auth-buttons'
import { ThemeToggle } from './theme-toggle'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const { user, isLoading } = useKindeBrowserClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-bold">
            ENEM Questões
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="transition-colors hover:text-foreground/80">
              Início
            </Link>
            {user && (
              <Link href="/history" className="transition-colors hover:text-foreground/80">
                Histórico
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
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
          <button className="p-2 md:hidden" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t py-4 px-4 bg-background">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="transition-colors hover:text-foreground/80 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            {user && (
              <Link
                href="/history"
                className="transition-colors hover:text-foreground/80 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Histórico
              </Link>
            )}
            <div className="border-t my-2 pt-4">
              {!isLoading && !user && (
                <div className="flex gap-4">
                  <LoginButton />
                  <RegisterButton />
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
