import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { logoutAction } from "@/features/auth/actions/logout";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { Button } from "@/components/ui/button";
import { type AdminRole } from "@/constants/navigation";
import { ROUTES } from "@/constants";

interface AdminTopbarProps {
  /** Nome (ou e-mail) exibido do usuário logado. */
  readonly userName: string;
  /** Papel do usuário logado — repassado ao menu mobile. */
  readonly role: AdminRole;
}

/**
 * Barra superior do painel: gatilho do menu mobile, identificação do
 * usuário logado e botão de logout. Recebe o usuário do layout (que já
 * o carrega uma vez), evitando uma segunda consulta de sessão.
 */
export function AdminTopbar({ userName, role }: AdminTopbarProps): React.ReactElement {
  return (
    <header className="border-border bg-background flex h-16 items-center gap-4 border-b px-4 sm:px-6">
      <AdminMobileNav role={role} />
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        {/* Atalho para voltar ao site público (abre em nova aba para não perder
            o contexto do painel). Discreto, junto do bloco do usuário. */}
        <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
          <Link href={ROUTES.home} target="_blank" rel="noopener noreferrer">
            <ExternalLink />
            <span className="hidden sm:inline">Ver site</span>
          </Link>
        </Button>
        {userName && (
          <span className="text-muted-foreground hidden text-sm sm:inline">{userName}</span>
        )}
        <form action={logoutAction}>
          <Button type="submit" variant="outline" size="sm">
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
