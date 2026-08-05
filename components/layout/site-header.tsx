"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LockKeyhole } from "lucide-react";

import { HeaderSearch } from "@/components/layout/header-search";
import { Logo } from "@/components/layout/logo";
import { MainNav } from "@/components/layout/main-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuoteCartButton } from "@/features/quote/components/quote-cart-button";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES } from "@/constants";

/** Rolagem (px) a partir da qual o cabeçalho deixa de ser transparente. */
const SCROLL_THRESHOLD = 24;

/**
 * Páginas cujo topo tem um hero escuro sobre o qual o cabeçalho fica
 * transparente (logo/links brancos), virando sólido ao rolar. A home sempre
 * teve esse comportamento; "Quem Somos" foi incluída para manter o menu no
 * mesmo estilo (consistência visual entre as páginas).
 */
const HERO_ROUTES: readonly string[] = [ROUTES.home, ROUTES.about, ROUTES.products];

/**
 * Cabeçalho do site público — **barra única** (sem faixa utilitária): logo,
 * navegação principal, ícones (busca + painel admin) e CTA de cotação.
 *
 * Comportamento sobre o hero (páginas em `HERO_ROUTES` — home e Quem Somos): o
 * cabeçalho é `fixed` e fica **transparente**, integrado ao banner (logo branco,
 * links brancos). Ao rolar
 * — ou em qualquer página sem hero — vira **sólido**: fundo branco com blur e
 * sombra suave, numa transição elegante.
 *
 * Exceção: nas telas de DETALHE do produto (`/produtos/<slug>`) e "Nossas
 * Unidades" o cabeçalho é **azul sólido** (institucional) — o mesmo azul escuro
 * do rodapé (`#0e2c62`) —, com logo/links/ícones brancos e o item ativo com
 * realce translúcido. Vale só nessas telas; a listagem `/produtos` e as demais
 * páginas não mudam.
 *
 * Como o header é `fixed`, ele não ocupa espaço no fluxo; nas páginas sem hero
 * um espaçador de mesma altura evita que o conteúdo fique sob o cabeçalho. Na
 * home, o hero (full-screen) passa por baixo do header transparente de propósito.
 *
 * O CTA "Minha cotação" é o eixo de conversão do site. O ícone de cadeado
 * (painel admin) fica discreto no cluster de ícones da direita — sinaliza uma
 * área restrita/administrativa, não uma "área do cliente".
 */
export function SiteHeader(): React.ReactElement {
  const pathname = usePathname();
  const hasHero = HERO_ROUTES.includes(pathname);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll(); // sincroniza caso a página carregue já rolada
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparente apenas sobre o hero e no topo da página.
  const transparent = hasHero && !scrolled;

  // Telas com cabeçalho AZUL sólido (institucional/premium): detalhe do produto
  // (/produtos/<slug>) e "Nossas Unidades". Ambas usam o MESMO azul escuro do
  // rodapé (#0e2c62), para um topo institucional consistente. A listagem
  // /produtos (exata) NÃO entra aqui — já tem seu próprio hero navy.
  const isProductDetail = pathname.startsWith(`${ROUTES.products}/`);
  const isUnits = pathname === ROUTES.units;
  const blueHeader = isProductDetail || isUnits ? "bg-[#0e2c62]" : null;

  // Conteúdo em branco (logo/links/ícones) tanto sobre o hero quanto sobre o azul.
  const light = transparent || blueHeader !== null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 z-50 w-full transition-[background-color,box-shadow,border-color] duration-300",
          transparent
            ? "border-b border-transparent"
            : blueHeader
              ? `${blueHeader} border-b border-white/10 shadow-sm`
              : "border-border bg-background/85 supports-[backdrop-filter]:bg-background/70 border-b shadow-sm backdrop-blur",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Logo overHero={light} />
            <MainNav
              items={PUBLIC_NAV_ITEMS}
              light={light}
              label="Navegação principal"
              className="hidden md:flex"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <HeaderSearch light={light} className="hidden sm:block" />
            <QuoteCartButton className="hidden sm:inline-flex" />
            <MobileNav items={PUBLIC_NAV_ITEMS} light={light} />

            {/*
              Atalho administrativo (painel): fixado no **extremo canto direito
              da janela** em telas largas (`2xl:absolute` → sai do bloco central
              de 1280px e cola na borda do viewport, `right-8`). Em telas menores,
              onde não há margem sobrando, fica em fluxo ao lado do CTA/hambúrguer
              (`ml-4 sm:ml-6`) para nunca sobrepor os demais elementos.
              Visível, porém subordinado — cor esmaecida (`/70`) que não disputa
              atenção com o menu nem com o CTA, subindo a contraste no hover/foco.
            */}
            <Link
              href={ROUTES.admin.login}
              aria-label="Painel administrativo"
              title="Painel administrativo"
              className={cn(
                "focus-visible:ring-ring ml-4 inline-flex size-8 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none sm:ml-6 2xl:absolute 2xl:top-1/2 2xl:right-8 2xl:ml-0 2xl:-translate-y-1/2",
                light
                  ? "text-white/70 hover:bg-white/10 hover:text-white"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-accent",
              )}
            >
              <LockKeyhole className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/*
        Espaçador para compensar o header `fixed` nas páginas SEM hero (o header
        não ocupa espaço no fluxo). Na home, o hero full-screen passa por baixo
        do cabeçalho transparente, então não há espaçador. Altura = barra única
        (64px).
      */}
      {!hasHero && <div aria-hidden="true" className="h-16" />}
    </>
  );
}
