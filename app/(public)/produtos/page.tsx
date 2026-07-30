import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard } from "@/features/catalog/components/product-card";
import { CatalogFilterPanel } from "@/features/catalog/components/catalog-filter-panel";
import { CatalogSort } from "@/features/catalog/components/catalog-sort";
import {
  listActiveSuppliers,
  listActiveCategoryTree,
  listPublicProducts,
  type CatalogSort as CatalogSortValue,
} from "@/features/catalog/services/catalog-service";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Produtos",
  description:
    "Encontre os produtos ideais para o seu negócio. Navegue pelas categorias e fornecedores para montar sua cotação de forma rápida e organizada.",
};

interface ProductsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Lê um parâmetro de busca como string simples (ignora arrays/vazios). */
function readParam(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text && text.trim() !== "" ? text.trim() : undefined;
}

const VALID_SORTS: readonly CatalogSortValue[] = ["relevancia", "nome", "recentes"];

/** Sequência de páginas a exibir, com elipses (`null`) quando há muitas. */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | null)[] = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) result.push(null);
    result.push(page);
    previous = page;
  }
  return result;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const q = readParam(params.q);
  const categoria = readParam(params.categoria);
  const fornecedor = readParam(params.fornecedor);
  const ordenarRaw = readParam(params.ordenar) as CatalogSortValue | undefined;
  const ordenar = ordenarRaw && VALID_SORTS.includes(ordenarRaw) ? ordenarRaw : undefined;
  const page = Number(readParam(params.pagina)) || 1;

  const [result, categoryTree, suppliers] = await Promise.all([
    listPublicProducts({
      q,
      categorySlug: categoria,
      supplierSlug: fornecedor,
      sort: ordenar,
      page,
    }),
    listActiveCategoryTree(),
    listActiveSuppliers(),
  ]);

  const buildPageHref = (targetPage: number): string => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (categoria) next.set("categoria", categoria);
    if (fornecedor) next.set("fornecedor", fornecedor);
    if (ordenar) next.set("ordenar", ordenar);
    if (targetPage > 1) next.set("pagina", String(targetPage));
    const query = next.toString();
    return query ? `${ROUTES.products}?${query}` : ROUTES.products;
  };

  return (
    <>
      {/* Hero institucional — mesma linguagem visual da Home e da página Sobre
          (base #0e2c62 + gradiente da marca + acento vermelho). Altura fixa,
          conteúdo centralizado verticalmente, container 1280px, apenas título +
          subtítulo. A navbar fica transparente por cima (rota em HERO_ROUTES). */}
      <section className="text-primary-foreground relative flex min-h-[340px] items-center overflow-hidden bg-[#0e2c62]">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #0e2c62 0%, #17479e 58%, #2159bd 100%), radial-gradient(60% 120% at 100% 0%, rgba(237,28,36,0.14) 0%, rgba(237,28,36,0) 55%), radial-gradient(45% 90% at 0% 100%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 pb-24 lg:px-8">
          <h1 className="font-display text-4xl leading-[1.08] font-extrabold tracking-tight text-balance sm:text-5xl">
            Produtos
          </h1>
          <p className="mt-3.5 max-w-2xl text-base leading-relaxed text-pretty text-white/85 sm:text-lg">
            Encontre os produtos ideais para o seu negócio. Navegue pelas categorias e fornecedores
            para montar sua cotação de forma rápida e organizada.
          </p>
        </div>
      </section>

      {/* Caixa de filtros sobreposta ao hero (invade a base da faixa azul),
          criando a transição entre o hero e a listagem. */}
      <div className="relative z-20 mx-auto -mt-[70px] w-full max-w-7xl min-w-0 px-4 sm:px-6 lg:px-8">
        <CatalogFilterPanel
          categories={categoryTree.map((root) => ({
            slug: root.slug,
            name: root.name,
            children: root.children.map((child) => ({ slug: child.slug, name: child.name })),
          }))}
          suppliers={suppliers.map((supplier) => ({
            slug: supplier.slug,
            name: supplier.name,
            logoUrl: supplier.logoUrl,
          }))}
        />
      </div>

      <section className="mx-auto w-full max-w-7xl min-w-0 px-4 pt-10 pb-16 sm:px-6 lg:px-8">
        {result.items.length === 0 ? (
          <div className="border-border text-muted-foreground rounded-2xl border border-dashed p-12 text-center">
            Nenhum produto encontrado com os filtros selecionados.
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-foreground text-base font-medium">
                <span className="font-bold">{result.total}</span>{" "}
                <span className="text-muted-foreground font-normal">
                  produto{result.total === 1 ? "" : "s"} encontrado{result.total === 1 ? "" : "s"}
                </span>
              </p>
              <CatalogSort />
            </div>

            <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-6">
              {result.items.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>

            {result.totalPages > 1 && (
              <nav
                className="mt-12 flex items-center justify-center gap-1.5"
                aria-label="Paginação"
              >
                <PaginationArrow
                  href={buildPageHref(result.page - 1)}
                  disabled={result.page <= 1}
                  direction="prev"
                />
                {pageWindow(result.page, result.totalPages).map((entry, index) =>
                  entry === null ? (
                    <span key={`gap-${index}`} className="text-muted-foreground px-1.5">
                      …
                    </span>
                  ) : (
                    <Link
                      key={entry}
                      href={buildPageHref(entry)}
                      aria-current={entry === result.page ? "page" : undefined}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-200 active:scale-95",
                        entry === result.page
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-foreground hover:bg-accent hover:text-primary",
                      )}
                    >
                      {entry}
                    </Link>
                  ),
                )}
                <PaginationArrow
                  href={buildPageHref(result.page + 1)}
                  disabled={result.page >= result.totalPages}
                  direction="next"
                />
              </nav>
            )}
          </>
        )}
      </section>
    </>
  );
}

/** Seta de paginação (‹ ›). Desabilitada vira um span (sem link). */
function PaginationArrow({
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
    "flex size-10 items-center justify-center rounded-full border border-border transition-all duration-200";

  if (disabled) {
    return (
      <span className={cn(base, "text-muted-foreground/40")} aria-hidden>
        <Icon className="size-4" />
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        base,
        "hover:bg-accent hover:border-primary/40 hover:text-primary active:scale-95",
      )}
    >
      <Icon className="size-4" />
    </Link>
  );
}
