import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/services/current-user";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminTopbar } from "@/components/layout/admin-topbar";
import { AdminOnboarding } from "@/components/admin/onboarding/admin-onboarding";
import { ROUTES } from "@/constants";

/**
 * Layout do painel administrativo: sidebar + topbar em volta do conteúdo.
 *
 * Faz verificação de sessão como camada extra de defesa em profundidade.
 * O middleware (`middleware.ts`) já bloqueia acesso não autenticado a
 * `/admin/*`, mas essa checagem garante segurança mesmo se o middleware for
 * bypassed (ex.: por má configuração de proxy). Usa `getCurrentUser` (dados
 * frescos do banco): derruba também usuário desativado no meio da sessão e
 * fornece o `role` para filtrar a navegação (esconder "Usuários" de EDITOR).
 */
interface AdminLayoutProps {
  readonly children: React.ReactNode;
}

export default async function AdminLayout({
  children,
}: AdminLayoutProps): Promise<React.ReactElement> {
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.admin.login);
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar role={user.role} />
      <div className="bg-muted/40 flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopbar userName={user.name} role={user.role} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <AdminOnboarding role={user.role} />
    </div>
  );
}
