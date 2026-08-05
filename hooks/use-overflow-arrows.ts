"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

interface UseOverflowArrowsOptions {
  /**
   * Passo de cada clique nas setas: número de px (fixo) ou "page" (a largura
   * visível do scroller). Padrão "page" — com poucos itens, um clique já chega
   * ao fim e mostra o último item inteiro (o `scrollBy` é limitado ao intervalo).
   */
  readonly step?: number | "page";
  /**
   * Recalcula a visibilidade das setas quando este valor muda (ex.: a troca de
   * categoria troca as subcategorias exibidas, mudando o overflow).
   */
  readonly revalidateKey?: unknown;
}

interface UseOverflowArrows<T extends HTMLElement> {
  readonly scrollerRef: RefObject<T | null>;
  readonly canLeft: boolean;
  readonly canRight: boolean;
  readonly scrollByDir: (direction: 1 | -1) => void;
}

/**
 * Lógica compartilhada dos carrosséis de linha única (fornecedores, categorias,
 * segmentos, produtos relacionados): mede o overflow horizontal e expõe se há
 * conteúdo a rolar para cada lado (para exibir as setas ◂ ▸ só quando fizer
 * sentido) + uma função para rolar. Recalcula ao rolar, ao redimensionar a
 * janela e quando `revalidateKey` muda. Antes essa mesma lógica estava copiada
 * em quatro componentes; centralizá-la garante comportamento idêntico.
 */
export function useOverflowArrows<T extends HTMLElement = HTMLUListElement>({
  step = "page",
  revalidateKey,
}: UseOverflowArrowsOptions = {}): UseOverflowArrows<T> {
  const scrollerRef = useRef<T | null>(null);
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
  }, [updateArrows, revalidateKey]);

  const scrollByDir = useCallback(
    (direction: 1 | -1): void => {
      const el = scrollerRef.current;
      if (!el) return;
      const amount = step === "page" ? el.clientWidth : step;
      el.scrollBy({ left: direction * amount, behavior: "smooth" });
    },
    [step],
  );

  return { scrollerRef, canLeft, canRight, scrollByDir };
}
