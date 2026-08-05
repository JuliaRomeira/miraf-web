"use client";

import { ProductCard, type CatalogProduct } from "@/features/catalog/components/product-card";
import { CarouselArrow } from "@/components/shared/carousel-arrow";
import { useOverflowArrows } from "@/hooks/use-overflow-arrows";

interface RelatedProductsProps {
  readonly products: readonly CatalogProduct[];
}

/**
 * Carrossel horizontal de produtos relacionados (mesmos cards do catálogo). Setas
 * ◂ ▸ aparecem só quando há overflow; no mobile o gesto de arrastar já rola.
 */
export function RelatedProducts({ products }: RelatedProductsProps): React.ReactElement | null {
  const { scrollerRef, canLeft, canRight, scrollByDir } = useOverflowArrows<HTMLUListElement>({
    revalidateKey: products.length,
  });

  if (products.length === 0) return null;

  return (
    <section className="border-border mt-16 border-t pt-10">
      <h2 className="font-display text-xl font-bold tracking-tight">Produtos relacionados</h2>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">
        Outros itens que combinam com este produto.
      </p>

      <div className="relative min-w-0">
        {canLeft && (
          <CarouselArrow
            direction="left"
            onClick={() => scrollByDir(-1)}
            label="Ver produtos anteriores"
            className="top-1/3 hidden sm:flex"
          />
        )}

        <ul
          ref={scrollerRef}
          className="no-scrollbar flex snap-x gap-4 overflow-x-auto scroll-smooth pb-2 lg:gap-6"
        >
          {products.map((product) => (
            <li key={product.id} className="w-56 shrink-0 snap-start sm:w-64">
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        {canRight && (
          <CarouselArrow
            direction="right"
            onClick={() => scrollByDir(1)}
            label="Ver mais produtos"
            className="top-1/3 hidden sm:flex"
          />
        )}
      </div>
    </section>
  );
}
