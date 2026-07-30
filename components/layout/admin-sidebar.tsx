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
 * Em telas menores, a navegação é acessada via `AdminMobileNav` na topbar.
 */
export function AdminSidebar({ role }: AdminSidebarProps): React.ReactElement {
  return (
    <aside className="border-border hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="border-border flex h-16 items-center border-b px-6">
        <Logo priority={false} href={ROUTES.admin.dashboard} label="Mira — painel administrativo" />
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <AdminNav role={role} />
      </div>
    </aside>
  );
}
