"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { type AdminRole, visibleAdminNavItems } from "@/constants/navigation";

interface AdminNavProps {
  /** Papel do usuário logado — filtra os itens `adminOnly`. */
  readonly role: AdminRole;
  /** Chamado ao clicar em um item — usado para fechar o menu mobile. */
  readonly onNavigate?: () => void;
}

/**
 * Lista de navegação do painel administrativo, com ícones e destaque do
 * item ativo. Reutilizada na sidebar (desktop) e no menu mobile.
 */
export function AdminNav({ role, onNavigate }: AdminNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {visibleAdminNavItems(role).map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
