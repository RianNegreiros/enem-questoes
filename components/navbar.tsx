"use client";

import Link from "next/link";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginButton, RegisterButton, UserButton } from "./auth-buttons";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const { user, isLoading } = useKindeBrowserClient();

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
          {isLoading ? null : user ? (
            <UserButton />
          ) : (
            <>
              <LoginButton />
              <RegisterButton />
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 