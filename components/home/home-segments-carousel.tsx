"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ImageIcon } from "lucide-react";

import { ROUTES } from "@/constants";
import { CarouselArrow } from "@/components/shared/carousel-arrow";
import { useOverflowArrows } from "@/hooks/use-overflow-arrows";

export interface HomeSegment {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly imageUrl: string | null;
  /** Linha de apoio: subcategorias (até 4) ou texto padrão. */
  readonly examples: string;
}

interface HomeSegmentsCarouselProps {
  readonly segments: readonly HomeSegment[];
}

/**
 * Carrossel horizontal de segmentos — mesmo padrão de navegação do Hero Banner:
 * setas ◂ ▸ nas laterais (tablet+), rolagem horizontal suave e responsiva. Em
 * telas pequenas o gesto de arrastar já rola naturalmente (setas ocultas).
 *
 * As setas aparecem só quando há conteúdo a rolar para aquele lado. Cada clique
 * avança uma "página" (a largura visível do scroller): como há poucos segmentos,
 * um único clique já chega ao fim e mostra o último card inteiro (o `scrollBy` é
 * limitado ao máximo), sem cards cortados nem segundo clique.
 */
export function HomeSegmentsCarousel({ segments }: HomeSegmentsCarouselProps): React.ReactElement {
  const { scrollerRef, canLeft, canRight, scrollByDir } = useOverflowArrows<HTMLUListElement>({
    revalidateKey: segments.length,
  });

  return (
    <div className="relative min-w-0">
      {canLeft && (
        <CarouselArrow
          direction="left"
          onClick={() => scrollByDir(-1)}
          label="Ver segmentos anteriores"
          tone="onDark"
          className="top-[38%] left-2 hidden size-11 sm:flex"
        />
      )}

      <ul
        ref={scrollerRef}
        className="no-scrollbar flex snap-x gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {segments.map((segment) => (
          <li key={segment.id} className="w-72 shrink-0 snap-start sm:w-80">
            <Link
              href={`${ROUTES.products}?categoria=${segment.slug}`}
              className="group border-border bg-card shadow-soft hover:shadow-soft-md block h-full overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1"
            >
              <div className="bg-muted border-border relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b">
                {segment.imageUrl ? (
                  <Image
                    src={segment.imageUrl}
                    alt={segment.name}
                    fill
                    sizes="320px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <ImageIcon className="text-muted-foreground/40 size-10" aria-hidden />
                )}
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-bold tracking-tight">{segment.name}</h3>
                <p className="text-muted-foreground mt-1 line-clamp-2 text-sm leading-relaxed">
                  {segment.examples}
                </p>
                <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
                  Explorar
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {canRight && (
        <CarouselArrow
          direction="right"
          onClick={() => scrollByDir(1)}
          label="Ver mais segmentos"
          tone="onDark"
          className="top-[38%] right-2 hidden size-11 sm:flex"
        />
      )}
    </div>
  );
}
