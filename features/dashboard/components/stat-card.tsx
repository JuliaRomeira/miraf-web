import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Texto de apoio abaixo do valor (ex.: "de 42 no total"). */
  hint?: string;
  /** Quando informado, o card inteiro vira um link para a seção. */
  href?: string;
  /** Destaca o card (usado para o indicador que exige ação). */
  emphasis?: boolean;
}

/**
 * Cartão de indicador (KPI) do dashboard. Puramente apresentacional: recebe
 * um número já calculado pelo service. Vira link apenas quando `href` existe.
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  emphasis = false,
}: StatCardProps): React.ReactElement {
  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <Icon
          className={cn("size-5 shrink-0", emphasis ? "text-primary" : "text-muted-foreground")}
          aria-hidden
        />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
      </div>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </>
  );

  const className = cn(
    "bg-card text-card-foreground rounded-lg border p-5 transition-colors",
    emphasis ? "border-primary/40" : "border-border",
    href &&
      "hover:border-primary/60 hover:bg-accent/40 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
