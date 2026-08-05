"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { CarouselArrow } from "@/components/shared/carousel-arrow";
import { useOverflowArrows } from "@/hooks/use-overflow-arrows";

export interface SectionSupplier {
  readonly slug: string;
  readonly name: string;
  readonly logoUrl: string | null;
}

interface SupplierSectionProps {
  readonly suppliers: readonly SectionSupplier[];
}

/**
 * Carrossel de fornecedores (logos) acima da listagem, inspirado na referência
 * de UX: cards roláveis na horizontal com setas ◂ ▸. Clicar em um fornecedor
 * aplica o filtro (`?fornecedor=slug`) preservando os demais filtros e
 * reiniciando a paginação; o ativo fica destacado e clicar nele de novo (ou em
 * "Limpar") remove o filtro. As setas aparecem só quando há overflow para
 * aquele lado.
 */
export function SupplierSection({ suppliers }: SupplierSectionProps): React.ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { scrollerRef, canLeft, canRight, scrollByDir } = useOverflowArrows<HTMLUListElement>({
    step: 280,
    revalidateKey: suppliers.length,
  });

  if (suppliers.length === 0) {
    return null;
  }

  const activeSlug = searchParams.get("fornecedor") ?? "";

  const hrefFor = (slug: string): string => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("fornecedor", slug);
    } else {
      params.delete("fornecedor");
    }
    params.delete("pagina");
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  return (
    <section aria-label="Fornecedores" className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Fornecedores
        </h3>
        {activeSlug && (
          <Link
            href={hrefFor("")}
            className="text-muted-foreground hover:text-foreground text-xs font-medium underline-offset-4 hover:underline"
          >
            Limpar fornecedor
          </Link>
        )}
      </div>

      <div className="relative min-w-0">
        {canLeft && (
          <CarouselArrow
            direction="left"
            onClick={() => scrollByDir(-1)}
            label="Ver fornecedores anteriores"
          />
        )}

        <ul
          ref={scrollerRef}
          className="no-scrollbar flex snap-x gap-3 overflow-x-auto px-0.5 pt-0.5 pb-1"
        >
          {suppliers.map((supplier) => {
            const isActive = supplier.slug === activeSlug;
            return (
              <li key={supplier.slug} className="snap-start">
                <Link
                  href={isActive ? hrefFor("") : hrefFor(supplier.slug)}
                  aria-current={isActive ? "true" : undefined}
                  title={supplier.name}
                  className={cn(
                    // Estados unificados com os chips de categoria (normal/hover/ativo/focus).
                    // Elevação sutil no hover para parecer um componente clicável.
                    "focus-visible:ring-primary/50 flex h-14 w-36 shrink-0 items-center justify-center rounded-2xl border px-4 transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none",
                    isActive
                      ? "border-primary bg-accent text-primary ring-primary/40 shadow-soft ring-1"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:shadow-soft hover:-translate-y-0.5",
                  )}
                >
                  {supplier.logoUrl ? (
                    <span className="relative h-8 w-full">
                      <Image
                        src={supplier.logoUrl}
                        alt={supplier.name}
                        fill
                        sizes="144px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <span className="text-center text-sm font-semibold">{supplier.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {canRight && (
          <CarouselArrow
            direction="right"
            onClick={() => scrollByDir(1)}
            label="Ver mais fornecedores"
          />
        )}
      </div>
    </section>
  );
}
