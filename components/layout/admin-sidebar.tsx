import { AdminNav } from "@/components/layout/admin-nav";
import { Logo } from "@/components/layout/logo";
import { type AdminRole } from "@/constants/navigation";
import { ROUTES } from "@/constants";

interface AdminSidebarProps {
  /** Papel do usuário logado — repassado ao `AdminNav` para filtrar itens. */
  readonly role: AdminRole;
}

/**
 * Barra lateral fixa do painel administrativo (visível a partir de `md`).
 * Usa o azul-marinho da marca Mira (mesmo tom do rodapé do site) para dar
 * identidade forte ao painel, mantendo o conteúdo em fundo claro. Em telas
 * menores, a navegação é acessada via `AdminMobileNav` na topbar.
 */
export function AdminSidebar({ role }: AdminSidebarProps): React.ReactElement {
  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-[#0e2c62] to-[#123a7e] text-white md:flex">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Logo
          priority={false}
          overHero
          href={ROUTES.admin.dashboard}
          label="Mira — painel administrativo"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <AdminNav role={role} showHelp />
      </div>
    </aside>
  );
}
