import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface AdminPaginationProps {
  readonly page: number;
  readonly totalPages: number;
  /** Monta o href de uma página preservando os filtros atuais. */
  readonly makeHref: (page: number) => string;
}

/**
 * Paginador compacto para as tabelas do painel (Anterior · "Página X de Y" ·
 * Próxima). Some quando há uma única página. Botões desabilitados viram spans.
 */
export function AdminPagination({
  page,
  totalPages,
  makeHref,
}: AdminPaginationProps): React.ReactElement | null {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Paginação">
      <PagerLink href={makeHref(page - 1)} disabled={page <= 1} direction="prev" />
      <span className="text-muted-foreground text-sm">
        Página <span className="text-foreground font-medium">{page}</span> de {totalPages}
      </span>
      <PagerLink href={makeHref(page + 1)} disabled={page >= totalPages} direction="next" />
    </nav>
  );
}

function PagerLink({
  href,
  disabled,
  direction,
}: {
  readonly href: string;
  readonly disabled: boolean;
  readonly direction: "prev" | "next";
}): React.ReactElement {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  const label = direction === "prev" ? "Página anterior" : "Próxima página";
  const base =
    "border-border inline-flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors";

  if (disabled) {
    return (
      <span className={cn(base, "text-muted-foreground/40 cursor-not-allowed")} aria-hidden>
        {direction === "prev" && <Icon className="size-4" />}
        {direction === "prev" ? "Anterior" : "Próxima"}
        {direction === "next" && <Icon className="size-4" />}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(base, "hover:bg-accent hover:border-primary/40")}
    >
      {direction === "prev" && <Icon className="size-4" />}
      {direction === "prev" ? "Anterior" : "Próxima"}
      {direction === "next" && <Icon className="size-4" />}
    </Link>
  );
}
