import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  /** Texto de apoio abaixo do valor (ex.: "de 42 no total"). */
  hint?: string;
  /** Quando informado, o card inteiro vira um link para a seção. */
  href?: string;
  /**
   * `attention` destaca o card em vermelho (usado quando há algo aguardando
   * ação, como cotações pendentes). `default` usa o azul da marca.
   */
  tone?: "default" | "attention";
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
  tone = "default",
}: StatCardProps): React.ReactElement {
  const attention = tone === "attention" && value > 0;

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            attention ? "bg-brand/10 text-brand" : "bg-accent text-primary",
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        {href && (
          <ArrowUpRight className="text-muted-foreground/50 group-hover:text-primary size-4 transition-colors" />
        )}
      </div>
      <div className="mt-4">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        <p className="text-muted-foreground mt-0.5 text-sm font-medium">{label}</p>
      </div>
      {hint && <p className="text-muted-foreground/80 mt-1 text-xs">{hint}</p>}
    </>
  );

  const className = cn(
    "group bg-card text-card-foreground shadow-soft block rounded-xl border p-5 transition-all",
    attention ? "border-brand/30" : "border-border",
    href && "hover:shadow-soft-md hover:-translate-y-0.5 hover:border-primary/40",
    href &&
      "focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
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
