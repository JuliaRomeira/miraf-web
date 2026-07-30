"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { ROUTES } from "@/constants";

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
  }, [updateArrows, segments.length]);

  const scrollByDir = (direction: 1 | -1): void => {
    const el = scrollerRef.current;
    if (!el) return;
    // Avança uma "página" (largura visível). O scrollBy é limitado ao intervalo
    // válido, então com poucos segmentos um clique já chega ao fim (ou ao início)
    // e o último card fica inteiro, sem exigir um segundo clique.
    el.scrollBy({ left: direction * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="relative min-w-0">
      {canLeft && (
        <button
          type="button"
          onClick={() => scrollByDir(-1)}
          aria-label="Ver segmentos anteriores"
          className="absolute top-[38%] left-2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:flex"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      <ul
        ref={scrollerRef}
        className="flex snap-x [scrollbar-width:none] gap-6 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {segments.map((segment) => (
          <li key={segment.id} className="w-72 shrink-0 snap-start sm:w-80">
            <Link
              href={`${ROUTES.products}?categoria=${segment.slug}`}
              className="group border-border bg-card block h-full overflow-hidden rounded-2xl border shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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
        <button
          type="button"
          onClick={() => scrollByDir(1)}
          aria-label="Ver mais segmentos"
          className="absolute top-[38%] right-2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:flex"
        >
          <ChevronRight className="size-5" />
        </button>
      )}
    </div>
  );
}
