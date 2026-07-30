import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { ROUTES } from "@/constants";
import { CardAddToQuoteButton } from "./card-add-to-quote-button";

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  saleUnit: string;
  category: { name: string; slug: string };
  supplier: { name: string; slug: string } | null;
  images: { url: string; alt: string | null }[];
  _count: { flavors: number };
}

/**
 * Card de produto usado nas listagens do catálogo público. A área de imagem +
 * texto é um link para a página de detalhe; o botão de cotação fica como
 * elemento irmão (não aninhado no link) para reduzir o atrito do funil
 * principal — adicionar sem precisar abrir o produto.
 */
export function ProductCard({ product }: { product: CatalogProduct }): React.ReactElement {
  const cover = product.images[0];

  return (
    <article className="group border-border/70 bg-card hover:border-primary/40 shadow-soft hover:shadow-soft-md flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1">
      <Link
        href={ROUTES.productDetail(product.slug)}
        className="focus-visible:ring-ring flex flex-1 flex-col rounded-t-2xl focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="border-border/70 relative aspect-square overflow-hidden border-b bg-white">
          {cover ? (
            // object-contain (não cover): mostra a imagem inteira, sem recorte —
            // embalagens altas/largas variam de proporção. O padding dá respiro e
            // o quadrado mantém todos os cards do mesmo tamanho (grid alinhado).
            <Image
              src={cover.url}
              alt={cover.alt ?? product.name}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-[1.08]"
            />
          ) : (
            <div className="text-muted-foreground/40 flex h-full items-center justify-center">
              <ImageOff className="size-10" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center gap-1.5 px-4 pt-5 pb-4 text-center">
          <p className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
            {product.category.name}
            {product.supplier ? ` · ${product.supplier.name}` : ""}
          </p>
          <h3 className="group-hover:text-primary font-display line-clamp-2 min-h-[2.75rem] leading-snug font-semibold text-balance transition-colors">
            {product.name}
          </h3>
        </div>
      </Link>
      <div className="px-4 pb-5">
        <CardAddToQuoteButton
          product={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: cover?.url ?? null,
            flavorId: null,
            flavorName: null,
            unit: product.saleUnit,
          }}
          hasFlavors={product._count.flavors > 0}
        />
      </div>
    </article>
  );
}
