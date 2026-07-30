import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";
import { SITE_CONFIG } from "@/constants";

export const metadata: Metadata = {
  title: `Login — ${SITE_CONFIG.name}`,
};

/**
 * Página de login do painel administrativo, em `/login` (URL curta e
 * amigável). Fica fora dos grupos de rotas `(admin)` e `(public)`
 * propositalmente: usa só o layout raiz (sem sidebar do admin, sem
 * header/footer do site), resultando numa tela de login limpa. O grupo
 * `(admin)` e o middleware redirecionam para cá quando não há sessão.
 */
export default function LoginPage(): React.ReactElement {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Painel administrativo</h1>
          <p className="text-muted-foreground text-sm">
            Entre com suas credenciais para continuar.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
