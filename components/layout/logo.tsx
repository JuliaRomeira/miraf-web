"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

/**
 * Logo da Mira no cabeçalho, com tooltip acessível e variação por tema.
 *
 * - Duas versões do logo oficial: `/public/logo-mira.png` (tema claro) e
 *   `/public/logo-mira-dark.png` (tema escuro). A troca segue a estratégia de
 *   classe do projeto (`.dark`), via variantes `dark:` do Tailwind — o logo
 *   claro é ocultado (`dark:hidden`) e o escuro exibido (`hidden dark:block`)
 *   quando um ancestral tem a classe `.dark`. Sem JS extra.
 * - Sobre o hero (cabeçalho transparente, fundo azul-escuro) usa-se a versão
 *   **branca** (`/public/logo-mira-white.png`) para máximo contraste; ao rolar,
 *   com o cabeçalho sólido (fundo branco), volta a versão **colorida** oficial.
 *   A troca é controlada por `overHero`.
 * - `next/image` serve versões otimizadas/responsivas; dimensões fixas (102×34,
 *   proporção ~3.04:1 do original) reservam o espaço e evitam layout shift.
 *   `priority` só no logo claro (visível por padrão); o escuro carrega apenas
 *   quando o tema escuro o torna visível.
 * - Tooltip "Mira": estado explícito (hover + foco por teclado), some no blur
 *   e no Esc, transição suave. `aria-label` no link é o nome acessível; o
 *   tooltip é `aria-hidden` para não duplicar a leitura.
 */
interface LogoProps {
  /**
   * Carrega a imagem com prioridade (LCP). `true` no cabeçalho (acima da dobra);
   * passar `false` em usos abaixo da dobra, como o rodapé.
   */
  readonly priority?: boolean;
  /**
   * Destino do link. Padrão: a home do site público. No painel admin, aponta
   * para o dashboard (o "início" daquele contexto).
   */
  readonly href?: string;
  /** Nome acessível do link (`aria-label`). Ajustável por contexto. */
  readonly label?: string;
  /**
   * Chamado ao clicar — usado para fechar o menu mobile ao navegar pelo logo
   * (mesmo padrão do `AdminNav`).
   */
  readonly onNavigate?: () => void;
  /**
   * Exibe o tooltip "Mira" no hover/foco. Padrão `true` (cabeçalho/rodapé
   * públicos, onde o logo é a única identificação). Desligar em contextos onde
   * o rótulo é redundante — ex.: no menu mobile do painel, cujo Sheet foca o
   * logo ao abrir e faria o tooltip surgir sozinho. O `aria-label` permanece.
   */
  readonly tooltip?: boolean;
  /**
   * Sinaliza que a logo está sobre o hero (cabeçalho transparente, fundo
   * escuro). Quando `true`, usa a versão branca do logo; quando `false`
   * (cabeçalho sólido/fundo claro), usa a versão colorida oficial.
   */
  readonly overHero?: boolean;
}

export function Logo({
  priority = true,
  href = ROUTES.home,
  label = "Mira — página inicial",
  onNavigate,
  tooltip = true,
  overHero = false,
}: LogoProps = {}): React.ReactElement {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <Link
      href={href}
      aria-label={label}
      onClick={onNavigate}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background relative inline-flex items-center rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setShowTooltip(false);
        }
      }}
    >
      {overHero ? (
        <Image src="/logo-mira-white.png" alt="Mira" width={102} height={34} priority={priority} />
      ) : (
        <>
          <Image
            src="/logo-mira.png"
            alt="Mira"
            width={102}
            height={34}
            priority={priority}
            className="block dark:hidden"
          />
          <Image
            src="/logo-mira-dark.png"
            alt="Mira"
            width={102}
            height={34}
            className="hidden dark:block"
          />
        </>
      )}
      {tooltip && (
        <span
          aria-hidden="true"
          className={cn(
            "bg-foreground text-background pointer-events-none absolute top-full left-0 z-50 mt-2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap shadow-sm transition-opacity duration-200",
            showTooltip ? "opacity-100" : "opacity-0",
          )}
        >
          Mira
        </span>
      )}
    </Link>
  );
}
