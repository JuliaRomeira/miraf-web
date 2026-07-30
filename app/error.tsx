"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Página global de erro do App Router.
 *
 * MUST ser um Client Component (imposição do Next.js). Recebe o erro
 * capturado por um error boundary do segmento e uma função `reset` para
 * tentar renderizar novamente o segmento afetado.
 */
interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps): React.ReactElement {
  useEffect(() => {
    // Loga o erro em desenvolvimento; em produção, substituir por Sentry / similar.
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Algo deu errado</h1>
        <p className="text-muted-foreground">
          Ocorreu um erro inesperado. Tente novamente em alguns instantes.
        </p>
        <div className="pt-4">
          <Button onClick={reset}>Tentar novamente</Button>
        </div>
      </div>
    </main>
  );
}
