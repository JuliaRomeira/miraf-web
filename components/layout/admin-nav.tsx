"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import {
  ADMIN_HELP_NAV_ITEM,
  type AdminNavItem,
  type AdminRole,
  visibleAdminNavGroups,
} from "@/constants/navigation";

interface AdminNavProps {
  /** Papel do usuário logado — filtra os itens `adminOnly`. */
  readonly role: AdminRole;
  /** Chamado ao clicar em um item — usado para fechar o menu mobile. */
  readonly onNavigate?: () => void;
  /** Exibe o atalho "Central de ajuda" ao final da navegação. */
  readonly showHelp?: boolean;
}

/** Chave curta usada como âncora do tour interativo (último trecho da rota). */
function tourKey(href: string): string {
  return href.split("/").filter(Boolean).pop() ?? href;
}

/**
 * Lista de navegação do painel administrativo, agrupada por seção, com ícones
 * e destaque do item ativo. Estilizada para a sidebar azul-marinho da Mira —
 * item ativo em "pílula" branca com texto azul; inativos em branco suave.
 * Reutilizada na sidebar (desktop) e no menu mobile.
 */
export function AdminNav({
  role,
  onNavigate,
  showHelp = false,
}: AdminNavProps): React.ReactElement {
  const pathname = usePathname();
  const groups = visibleAdminNavGroups(role);

  const renderItem = ({ label, href, icon: Icon }: AdminNavItem): React.ReactElement => {
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        data-tour={tourKey(href)}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "text-primary bg-white shadow-sm"
            : "text-white/70 hover:bg-white/10 hover:text-white",
        )}
      >
        {/* Barra de acento vermelha (marca) no item ativo. */}
        {isActive && (
          <span
            aria-hidden
            className="bg-brand absolute top-1/2 -left-2 h-5 w-1 -translate-y-1/2 rounded-full"
          />
        )}
        <Icon
          className={cn(
            "size-[1.15rem] shrink-0 transition-colors",
            isActive ? "text-primary" : "text-white/60 group-hover:text-white",
          )}
        />
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex h-full flex-col gap-6">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-1">
          <p className="px-3 pb-1 text-[0.6875rem] font-semibold tracking-wider text-white/40 uppercase">
            {group.label}
          </p>
          {group.items.map(renderItem)}
        </div>
      ))}

      {showHelp && (
        <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-4">
          {renderItem(ADMIN_HELP_NAV_ITEM)}
        </div>
      )}
    </nav>
  );
}
