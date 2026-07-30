"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

export interface SectionSupplier {
  readonly slug: string;
  readonly name: string;
  readonly logoUrl: string | null;
}

interface SupplierSectionProps {
  readonly suppliers: readonly SectionSupplier[];
}

/** Quanto rolar (px) a cada clique nas setas. */
const SCROLL_STEP = 280;

/**
 * Carrossel de fornecedores (logos) acima da listagem, inspirado na referência
 * de UX: cards roláveis na horizontal com setas ◂ ▸. Clicar em um fornecedor
 * aplica o filtro (`?fornecedor=slug`) preservando os demais filtros e
 * reiniciando a paginação; o ativo fica destacado e clicar nele de novo (ou em
 * "Ver todos") remove o filtro. As setas aparecem só quando há overflow para
 * aquele lado.
 */
export function SupplierSection({ suppliers }: SupplierSectionProps): React.ReactElement | null {
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, suppliers.length]);

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

  const scrollByDir = (direction: 1 | -1): void => {
    scrollerRef.current?.scrollBy({ left: direction * SCROLL_STEP, behavior: "smooth" });
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
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Ver fornecedores anteriores"
            className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/2 left-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronLeft className="size-5" />
          </button>
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
                  aria-pressed={isActive}
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
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Ver mais fornecedores"
            className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/2 right-1 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
    </section>
  );
}
