import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { logoutAction } from "@/features/auth/actions/logout";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { HelpMenu } from "@/components/admin/help/help-menu";
import { Button } from "@/components/ui/button";
import { type AdminRole } from "@/constants/navigation";
import { ROUTES } from "@/constants";

interface AdminTopbarProps {
  /** Nome (ou e-mail) exibido do usuário logado. */
  readonly userName: string;
  /** Papel do usuário logado — repassado ao menu mobile e exibido no chip. */
  readonly role: AdminRole;
}

const ROLE_LABEL: Record<AdminRole, string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

/**
 * Barra superior do painel: gatilho do menu mobile, central de ajuda, atalho
 * para o site, identificação do usuário logado e logout. Recebe o usuário do
 * layout (que já o carrega uma vez), evitando uma segunda consulta de sessão.
 */
export function AdminTopbar({ userName, role }: AdminTopbarProps): React.ReactElement {
  const initial = userName.trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="bg-background/95 border-border sticky top-0 z-30 flex h-16 items-center gap-2 border-b px-4 backdrop-blur sm:px-6">
      <AdminMobileNav role={role} />

      <span className="text-muted-foreground hidden text-sm font-medium md:inline">
        Painel administrativo
      </span>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <HelpMenu />

        {/* Atalho para o site público (abre em nova aba para não perder o painel). */}
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary"
          data-tour="ver-site"
        >
          <Link href={ROUTES.home} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            <span className="hidden sm:inline">Ver site</span>
          </Link>
        </Button>

        <span className="bg-border mx-1 hidden h-6 w-px sm:block" aria-hidden />

        <div className="hidden items-center gap-2 sm:flex">
          <span
            className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-full text-sm font-semibold"
            aria-hidden
          >
            {initial}
          </span>
          <span className="leading-tight">
            <span className="text-foreground block text-sm font-medium">{userName}</span>
            <span className="text-muted-foreground block text-xs">{ROLE_LABEL[role]}</span>
          </span>
        </div>

        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
