import type { QuoteStatus } from "@prisma/client";

/**
 * Rótulos, ordem e cores dos status de cotação. Módulo compartilhado entre o
 * Dashboard e a aba Cotações do painel (fonte única — antes vivia no
 * dashboard).
 */

/** Ordem canônica de exibição (fluxo de atendimento). */
export const QUOTE_STATUS_ORDER: readonly QuoteStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export const QUOTE_STATUS_LABEL: Record<QuoteStatus, string> = {
  PENDING: "Pendente",
  IN_PROGRESS: "Em atendimento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

/** Classes do badge (fundo/texto) por status. */
export const QUOTE_STATUS_BADGE_CLASS: Record<QuoteStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  IN_PROGRESS: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  CANCELLED: "bg-muted text-muted-foreground",
};

/** Classes da barra proporcional (usada no resumo do dashboard). */
export const QUOTE_STATUS_BAR_CLASS: Record<QuoteStatus, string> = {
  PENDING: "bg-amber-500",
  IN_PROGRESS: "bg-primary",
  COMPLETED: "bg-green-500",
  CANCELLED: "bg-muted-foreground/40",
};
