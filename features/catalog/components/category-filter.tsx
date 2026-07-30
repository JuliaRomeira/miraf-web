"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface CategoryOption {
  readonly slug: string;
  readonly name: string;
}

interface CategoryNode extends CategoryOption {
  readonly children: readonly CategoryOption[];
}

interface CategoryFilterProps {
  readonly categories: readonly CategoryNode[];
}

/** Quanto rolar (px) a cada clique nas setas das barras roláveis. */
const SCROLL_STEP = 240;

/**
 * Barra de chips rolável em LINHA ÚNICA. Mantém os chips numa só linha (sem
 * quebrar) e, quando não cabem na largura, exibe setas ◂ ▸ (só quando há overflow
 * para aquele lado) para rolar horizontalmente. Reutilizada pela linha de
 * categorias principais e pela de subcategorias — mesmo comportamento do carrossel
 * de fornecedores, para consistência visual. `revalidateKey` força o recálculo das
 * setas quando o conteúdo muda (ex.: troca de categoria troca as subcategorias).
 */
function ChipScroller({
  label,
  revalidateKey,
  className,
  children,
}: {
  readonly label: string;
  readonly revalidateKey: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}): React.ReactElement {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback((): void => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
    // Recalcula quando o conteúdo muda (troca de categoria → outras subcategorias).
  }, [updateArrows, revalidateKey]);

  const scrollByDir = (direction: 1 | -1): void => {
    scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <nav aria-label={label} className="relative min-w-0">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Rolar para a esquerda"
          className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/2 left-0 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      <ul
        ref={scrollerRef}
        className={cn("no-scrollbar flex snap-x gap-2 overflow-x-auto py-1", className)}
      >
        {children}
      </ul>

      {canRight && (
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Rolar para a direita"
          className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/2 right-0 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </nav>
  );
}

/**
 * Filtro de categorias em dois níveis. A primeira linha lista as categorias
 * principais; ao escolher uma que tenha subcategorias, aparece automaticamente uma
 * barra com as subcategorias daquela categoria (primeira opção "Todos"). Ambas as
 * linhas são barras roláveis de LINHA ÚNICA (`ChipScroller`) — os chips nunca
 * quebram linha; quando não cabem, surgem setas ◂ ▸ para rolar. O clique filtra os
 * produtos INSTANTANEAMENTE — navegação client-side (router.push com scroll:false
 * dentro de useTransition), sem recarregar. O estado vive na URL (`?categoria=slug`),
 * preservando busca/fornecedor.
 */
export function CategoryFilter({ categories }: CategoryFilterProps): React.ReactElement | null {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeSlug = searchParams.get("categoria") ?? "";

  // Raiz ativa: a própria raiz selecionada, ou a raiz da subcategoria ativa.
  const activeRoot =
    categories.find((root) => root.slug === activeSlug) ??
    categories.find((root) => root.children.some((child) => child.slug === activeSlug)) ??
    null;

  const hasSubBar = activeRoot !== null && activeRoot.children.length > 0;

  if (categories.length === 0) {
    return null;
  }

  const navigate = (slug: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("categoria", slug);
    } else {
      params.delete("categoria");
    }
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  const chip = (slug: string, label: string, isActive: boolean): React.ReactElement => (
    <li key={slug || "todos"} className="snap-start">
      <button
        type="button"
        onClick={() => navigate(slug)}
        aria-pressed={isActive}
        className={cn(
          // Estados unificados com os cards de fornecedor (normal/hover/ativo/focus).
          "focus-visible:ring-primary/50 inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-5 text-sm font-medium whitespace-nowrap transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]",
          isActive
            ? "border-primary bg-accent text-primary ring-primary/40 shadow-sm ring-1"
            : "border-border text-foreground hover:border-primary/40 hover:bg-accent hover:shadow-sm",
        )}
      >
        {label}
      </button>
    </li>
  );

  return (
    <div className={cn("space-y-3 transition-opacity", pending && "opacity-60")}>
      <ChipScroller label="Categorias" revalidateKey={categories.map((c) => c.slug).join(",")}>
        {chip("", "Todas", activeSlug === "")}
        {categories.map((root) => chip(root.slug, root.name, activeRoot?.slug === root.slug))}
      </ChipScroller>

      {hasSubBar && activeRoot && (
        <ChipScroller
          label={`Subcategorias de ${activeRoot.name}`}
          revalidateKey={activeRoot.slug}
          className="border-border/60 border-l-2 pr-1 pl-3"
        >
          {chip(activeRoot.slug, "Todos", activeSlug === activeRoot.slug)}
          {activeRoot.children.map((child) =>
            chip(child.slug, child.name, activeSlug === child.slug),
          )}
        </ChipScroller>
      )}
    </div>
  );
}
