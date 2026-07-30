/**
 * Skeletons de carregamento do painel. Usados nos `loading.tsx` das rotas admin
 * para dar feedback imediato enquanto os Server Components buscam os dados
 * (antes não havia nenhum estado de carregamento). Puro CSS (`animate-pulse`).
 */

/** Cabeçalho (título + subtítulo) em skeleton — comum a todas as telas. */
function HeaderSkeleton(): React.ReactElement {
  return (
    <div className="space-y-2">
      <div className="bg-muted h-7 w-44 animate-pulse rounded" />
      <div className="bg-muted/60 h-4 w-72 max-w-full animate-pulse rounded" />
    </div>
  );
}

/** Skeleton de tabela (listagens: produtos, categorias, fornecedores, etc.). */
export function AdminTableSkeleton(): React.ReactElement {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <HeaderSkeleton />
      <div className="border-border divide-border divide-y rounded-lg border">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 p-4">
            <div className="bg-muted size-10 shrink-0 animate-pulse rounded" />
            <div className="flex-1 space-y-2">
              <div className="bg-muted h-4 w-1/3 animate-pulse rounded" />
              <div className="bg-muted/60 h-3 w-1/5 animate-pulse rounded" />
            </div>
            <div className="bg-muted h-8 w-20 animate-pulse rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton de cards (dashboard). */
export function AdminCardsSkeleton(): React.ReactElement {
  return (
    <div className="space-y-8" aria-busy="true" aria-live="polite">
      <HeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border-border space-y-3 rounded-lg border p-5">
            <div className="bg-muted/60 h-4 w-24 animate-pulse rounded" />
            <div className="bg-muted h-8 w-16 animate-pulse rounded" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="border-border h-48 animate-pulse rounded-lg border" />
        ))}
      </div>
    </div>
  );
}
