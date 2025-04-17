"use client";

import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LoginButton, RegisterButton } from "./auth-buttons";

export function AuthCTA() {
  const { user, isLoading } = useKindeBrowserClient();

  if (isLoading || user) {
    return <></>
  }

  return (
    <div className="bg-muted rounded-lg p-4 my-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-medium">Crie uma conta para acompanhar seu progresso</h3>
          <p className="text-sm text-muted-foreground">
            Registre-se para salvar suas respostas e acompanhar seu desempenho.
          </p>
        </div>
        <div className="flex gap-2">
          <LoginButton />
          <RegisterButton />
        </div>
      </div>
    </div>
  );
} 