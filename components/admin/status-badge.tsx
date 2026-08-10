import { cn } from "@/lib/utils";

export type StatusTone = "success" | "neutral" | "warning" | "danger" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  neutral: "bg-muted text-muted-foreground",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-primary/10 text-primary",
};

interface StatusBadgeProps {
  readonly tone: StatusTone;
  readonly children: React.ReactNode;
  readonly className?: string;
}

/**
 * Etiqueta (badge) de status, com cores por tom. Padroniza a exibição de
 * estados (Ativo/Inativo/Rascunho...) nas tabelas do painel. Vermelho fica
 * reservado ao tom `danger` (atenção/estado crítico).
 */
export function StatusBadge({ tone, children, className }: StatusBadgeProps): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
