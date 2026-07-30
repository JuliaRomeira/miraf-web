"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/constants/navigation";

interface MainNavProps {
  readonly items: readonly NavItem[];
  readonly className?: string;
  /** Chamado ao clicar em um link — usado para fechar o menu mobile. */
  readonly onNavigate?: () => void;
  /**
   * Variante clara para uso sobre fundos escuros (cabeçalho transparente sobre
   * o hero): links em branco em vez das cores padrão.
   */
  readonly light?: boolean;
}

/**
 * Lista de links de navegação com destaque do item ativo (em azul da marca).
 * Reutilizada no header (horizontal) e no menu mobile (vertical) via className.
 */
export function MainNav({
  items,
  className,
  onNavigate,
  light = false,
}: MainNavProps): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center gap-3", className)}>
      {items.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-md px-5 py-3 text-[17px] font-medium transition-colors",
              light
                ? isActive
                  ? "font-semibold text-white"
                  : "text-white/80 hover:text-white"
                : isActive
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-primary",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
