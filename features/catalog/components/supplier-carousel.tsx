import Link from "next/link";
import Image from "next/image";

import { ROUTES } from "@/constants";

export interface CarouselSupplier {
  readonly slug: string;
  readonly name: string;
  readonly logoUrl: string | null;
}

interface SupplierCarouselProps {
  readonly suppliers: readonly CarouselSupplier[];
}

/**
 * Carrossel infinito de fornecedores (marquee) para a home.
 *
 * O loop contínuo é feito com CSS: a lista é duplicada e a faixa desliza até
 * `-50%` (exatamente um conjunto), então o corte é imperceptível — sem reinício
 * brusco. Velocidade calma (50s) para um deslize suave, sem parecer acelerado.
 * Pausa no hover e no foco por teclado (interação manual). A animação respeita
 * `prefers-reduced-motion` graças à regra global em `globals.css` (que zera
 * `animation-duration`), sem lógica extra aqui.
 *
 * Cada fornecedor leva à listagem de produtos já filtrada por ele
 * (`/produtos?fornecedor=slug`). A cópia duplicada é escondida de leitores de
 * tela e do foco por teclado (`aria-hidden` + `tabIndex={-1}`).
 *
 * Aparência: logos em cinza (dessaturadas) e levemente translúcidas por padrão;
 * no hover/foco a logo recupera a cor original, 100% de opacidade e cresce um
 * pouco (escala sutil), com transição suave — destacando só a marca explorada.
 */
export function SupplierCarousel({ suppliers }: SupplierCarouselProps): React.ReactElement | null {
  if (suppliers.length === 0) {
    return null;
  }

  const track = [...suppliers, ...suppliers];

  return (
    <div className="group relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul className="flex w-max animate-[marquee_50s_linear_infinite] items-center gap-16 group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] lg:gap-20">
        {track.map((supplier, index) => {
          const isClone = index >= suppliers.length;
          return (
            <li key={`${supplier.slug}-${index}`} aria-hidden={isClone}>
              <Link
                href={`${ROUTES.products}?fornecedor=${supplier.slug}`}
                tabIndex={isClone ? -1 : undefined}
                aria-label={`Ver produtos de ${supplier.name}`}
                className="focus-visible:ring-ring flex h-20 w-44 items-center justify-center rounded-lg px-5 opacity-70 grayscale transition duration-300 ease-out hover:scale-110 hover:opacity-100 hover:grayscale-0 focus-visible:scale-110 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:grayscale-0 focus-visible:outline-none"
              >
                {supplier.logoUrl ? (
                  <span className="relative h-16 w-full">
                    <Image
                      src={supplier.logoUrl}
                      alt={supplier.name}
                      fill
                      sizes="176px"
                      className="object-contain"
                    />
                  </span>
                ) : (
                  <span className="text-center text-base font-semibold">{supplier.name}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
