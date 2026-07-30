"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Building2, ImageIcon, Loader2, Search, Tag } from "lucide-react";

import { Input } from "@/components/ui/input";
import { useCatalogSearch } from "@/hooks/use-catalog-search";
import { SEARCH_MIN_LENGTH } from "@/features/catalog/search";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

interface GlobalSearchProps {
  /** Foca o campo ao montar (usado no popover do cabeçalho). */
  readonly autoFocus?: boolean;
  /** Chamado após navegar (fecha o popover/menu que envolve a busca). */
  readonly onNavigate?: () => void;
  readonly className?: string;
}

/** Destino de cada sugestão — sempre o catálogo já filtrado. */
type Suggestion = {
  readonly key: string;
  readonly href: string;
  readonly render: React.ReactNode;
};

/** Monta a URL do catálogo com os filtros informados (`q`/`categoria`/`fornecedor`). */
function catalogHref(params: Record<string, string>): string {
  return `${ROUTES.products}?${new URLSearchParams(params).toString()}`;
}

/**
 * Busca global do site (autocomplete). Enquanto o usuário digita, mostra
 * sugestões de produtos (nome/código), categorias e fornecedores. Selecionar
 * uma sugestão — ou pressionar Enter — leva ao catálogo com o resultado já
 * filtrado (produto → `?q=`, categoria → `?categoria=`, fornecedor →
 * `?fornecedor=`). É a única entrada de busca textual do site; o catálogo cuida
 * apenas dos filtros.
 *
 * Reutilizado no cabeçalho (dentro de um popover) e no menu mobile (inline).
 */
export function GlobalSearch({
  autoFocus,
  onNavigate,
  className,
}: GlobalSearchProps): React.ReactElement {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const { results, loading } = useCatalogSearch(term);
  const containerRef = useRef<HTMLDivElement>(null);

  const q = term.trim();

  // Lista achatada de sugestões na ordem de exibição — a mesma usada pela
  // navegação por teclado (setas + Enter). O "ver todos" é o último item.
  const suggestions = useMemo<Suggestion[]>(() => {
    const items: Suggestion[] = [];

    for (const product of results.products) {
      items.push({
        key: `product-${product.id}`,
        href: catalogHref({ q: product.name }),
        render: (
          <span className="flex items-center gap-3">
            <span className="bg-muted relative size-9 shrink-0 overflow-hidden rounded-md">
              {product.imageUrl ? (
                <Image src={product.imageUrl} alt="" fill sizes="36px" className="object-cover" />
              ) : (
                <ImageIcon className="text-muted-foreground absolute inset-0 m-auto size-4" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{product.name}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {product.sku ? `${product.sku} · ` : ""}
                {product.categoryName}
              </span>
            </span>
          </span>
        ),
      });
    }

    for (const category of results.categories) {
      items.push({
        key: `category-${category.id}`,
        href: catalogHref({ categoria: category.slug }),
        render: (
          <span className="flex items-center gap-3">
            <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
              <Tag className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{category.name}</span>
              <span className="text-muted-foreground block text-xs">Categoria</span>
            </span>
          </span>
        ),
      });
    }

    for (const supplier of results.suppliers) {
      items.push({
        key: `supplier-${supplier.id}`,
        href: catalogHref({ fornecedor: supplier.slug }),
        render: (
          <span className="flex items-center gap-3">
            <span className="bg-accent text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
              <Building2 className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{supplier.name}</span>
              <span className="text-muted-foreground block text-xs">Fornecedor</span>
            </span>
          </span>
        ),
      });
    }

    if (q.length >= SEARCH_MIN_LENGTH) {
      items.push({
        key: "see-all",
        href: catalogHref({ q }),
        render: (
          <span className="text-primary flex items-center gap-3 font-medium">
            <span className="flex size-9 shrink-0 items-center justify-center">
              <Search className="size-4" />
            </span>
            <span className="truncate">Ver todos os resultados para “{q}”</span>
          </span>
        ),
      });
    }

    return items;
  }, [results, q]);

  const showPanel = open && q.length >= SEARCH_MIN_LENGTH;
  const hasContent =
    results.products.length + results.categories.length + results.suppliers.length > 0;

  const go = (href: string): void => {
    setOpen(false);
    setTerm("");
    setActiveIndex(-1);
    onNavigate?.();
    router.push(href);
  };

  const handleSubmit = (event: React.FormEvent): void => {
    event.preventDefault();
    const active = activeIndex >= 0 ? suggestions[activeIndex] : undefined;
    if (active) {
      go(active.href);
      return;
    }
    if (q.length >= SEARCH_MIN_LENGTH) {
      go(catalogHref({ q }));
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, -1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Fecha quando o foco sai do conjunto campo+painel (clique fora / Tab).
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>): void => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} onBlur={handleBlur} className={cn("relative", className)}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            autoFocus={autoFocus}
            type="search"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setActiveIndex(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar produtos, categorias, fornecedores..."
            aria-label="Buscar no site"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="global-search-results"
            className="pl-9"
          />
          {loading && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin" />
          )}
        </div>
      </form>

      {showPanel && (
        <div
          id="global-search-results"
          role="listbox"
          className="border-border bg-background absolute top-full right-0 left-0 z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-xl border p-1 shadow-lg"
        >
          {suggestions.length === 0 ? (
            <p className="text-muted-foreground px-3 py-6 text-center text-sm">
              {loading ? "Buscando..." : "Nenhum resultado encontrado."}
            </p>
          ) : (
            <ul className="flex flex-col">
              {suggestions.map((suggestion, index) => (
                <li key={suggestion.key} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    // Impede o blur do campo antes do clique registrar.
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => go(suggestion.href)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      index === activeIndex ? "bg-accent" : "hover:bg-accent/60",
                      suggestion.key === "see-all" && "mt-1 border-t pt-2",
                    )}
                  >
                    {suggestion.render}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {hasContent && (
            <p className="sr-only" aria-live="polite">
              {suggestions.length} resultados
            </p>
          )}
        </div>
      )}
    </div>
  );
}
