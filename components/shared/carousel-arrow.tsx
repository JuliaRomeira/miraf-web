"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface CarouselArrowProps {
  readonly direction: "left" | "right";
  readonly onClick: () => void;
  /** Rótulo acessível (ex.: "Ver fornecedores anteriores"). */
  readonly label: string;
  /**
   * `neutral` (padrão): pílula clara com `.shadow-soft`, para carrosséis sobre
   * fundo claro. `onDark`: vidro branco translúcido, para carrosséis sobre
   * imagens/hero escuros.
   */
  readonly tone?: "neutral" | "onDark";
  /** Ajustes de posição/tamanho/visibilidade (ex.: "hidden sm:flex size-11 top-1/3"). */
  readonly className?: string;
}

/**
 * Seta de navegação de carrossel (◂ ▸) — aparência única em todo o site.
 * Antes cada carrossel desenhava a própria seta (tamanhos e sombras diferentes);
 * agora todas compartilham este componente. Tamanho `size-9` e posição vertical
 * centralizada por padrão; posição horizontal derivada da direção. Tudo
 * ajustável via `className`.
 */
export function CarouselArrow({
  direction,
  onClick,
  label,
  tone = "neutral",
  className,
}: CarouselArrowProps): React.ReactElement {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full transition focus-visible:ring-2 focus-visible:outline-none",
        direction === "left" ? "left-1" : "right-1",
        tone === "neutral"
          ? "border-border bg-background/90 hover:bg-accent focus-visible:ring-ring shadow-soft border backdrop-blur"
          : "border border-white/25 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 focus-visible:ring-white",
        className,
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
