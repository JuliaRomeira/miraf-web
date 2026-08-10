import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  readonly title: string;
  readonly description?: string;
  /** Ações à direita (ex.: botão "Novo produto"). */
  readonly children?: React.ReactNode;
  readonly className?: string;
}

/**
 * Cabeçalho padrão das páginas do painel: título (fonte de destaque), descrição
 * opcional e uma área de ações à direita. Padroniza o topo de todas as telas.
 */
export function AdminPageHeader({
  title,
  description,
  children,
  className,
}: AdminPageHeaderProps): React.ReactElement {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {/* Acento vertical vermelho da marca. */}
        <span aria-hidden className="bg-brand mt-1 h-7 w-1 shrink-0 rounded-full" />
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground text-sm">{description}</p>}
        </div>
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </header>
  );
}
