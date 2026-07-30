"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductCard, type CatalogProduct } from "@/features/catalog/components/product-card";

interface RelatedProductsProps {
  readonly products: readonly CatalogProduct[];
}

/**
 * Carrossel horizontal de produtos relacionados (mesmos cards do catálogo). Setas
 * ◂ ▸ aparecem só quando há overflow; no mobile o gesto de arrastar já rola.
 */
export function RelatedProducts({ products }: RelatedProductsProps): React.ReactElement | null {
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
  }, [updateArrows, products.length]);

  if (products.length === 0) return null;

  const scrollByDir = (direction: 1 | -1): void => {
    const el = scrollerRef.current;
    if (el) el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  return (
    <section className="border-border mt-16 border-t pt-10">
      <h2 className="font-display text-xl font-bold tracking-tight">Produtos relacionados</h2>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">
        Outros itens que combinam com este produto.
      </p>

      <div className="relative min-w-0">
        {canLeft && (
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Ver produtos anteriores"
            className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/3 left-1 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}

        <ul
          ref={scrollerRef}
          className="flex snap-x [scrollbar-width:none] gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] lg:gap-6 [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <li key={product.id} className="w-56 shrink-0 snap-start sm:w-64">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {canRight && (
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Ver mais produtos"
            className="border-border bg-background/90 hover:bg-accent focus-visible:ring-ring absolute top-1/3 right-1 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-md backdrop-blur transition focus-visible:ring-2 focus-visible:outline-none sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        )}
      </div>
    </section>
  );
}
