"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Headset,
  History,
  Package,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BRAND_HERO_GRADIENT,
  DEFAULT_HERO_CTAS,
  HERO_SLIDES,
  HERO_TRUST_BADGES,
  type HeroTrustIcon,
} from "@/components/home/hero-slides";

const AUTOPLAY_MS = 6500;
const PARALLAX_FACTOR = 0.3;
const PARALLAX_MAX_RATIO = 0.15; // teto do deslocamento (fração da altura da viewport)

const TRUST_ICONS: Record<HeroTrustIcon, LucideIcon> = {
  history: History,
  package: Package,
  headset: Headset,
  truck: Truck,
};

/**
 * Hero da página inicial — slider full-screen (≈78svh) com foco no banner.
 *
 * Fundo rotativo em tela cheia (foto ou degradê institucional da marca enquanto
 * as fotos não existem) com o conteúdo sobreposto em coluna única: kicker,
 * título display e subtítulo (trocam a cada slide) + botões e selos de
 * confiança (fixos, montam uma vez).
 *
 * Mantém: Ken Burns, fade entre slides, parallax sutil e overlay azul/vermelho
 * da marca. Comportamento: troca automática (6,5s), pausa no hover/foco e com a
 * aba oculta, navegação por setas (tablet+) e bolinhas, teclado ←/→. Tudo
 * desligado sob `prefers-reduced-motion`. Performance: só o 1º banner é
 * pré-carregado; animações em `transform`/`opacity`.
 *
 * A transição para a próxima seção não é feita aqui: `HomeSuppliers` é um card
 * flutuante que sobe e sobrepõe a base do hero (continuidade visual). As
 * bolinhas ficam logo acima da borda desse card.
 */
export function HomeHero(): React.ReactElement {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const parallaxRef = useRef<HTMLDivElement>(null);
  const slideCount = HERO_SLIDES.length;

  const goTo = useCallback(
    (index: number) => setCurrent((index + slideCount) % slideCount),
    [slideCount],
  );
  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Respeita a preferência de movimento reduzido do sistema.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = (): void => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  // Pausa a troca automática quando a aba fica oculta.
  useEffect(() => {
    const onVisibility = (): void => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Troca automática (setTimeout reagendado a cada slide/pausa).
  useEffect(() => {
    if (paused || reducedMotion || slideCount <= 1) return;
    const timer = window.setTimeout(next, AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [current, paused, reducedMotion, slideCount, next]);

  // Parallax sutil: desloca o plano de fundo mais devagar que a rolagem.
  useEffect(() => {
    if (reducedMotion) return;
    let raf = 0;
    const onScroll = (): void => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = parallaxRef.current;
        if (!el) return;
        const y = window.scrollY;
        if (y > window.innerHeight) return; // só enquanto o hero está visível
        const shift = Math.min(y * PARALLAX_FACTOR, window.innerHeight * PARALLAX_MAX_RATIO);
        el.style.transform = `translate3d(0, ${shift}px, 0)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reducedMotion]);

  const slide = HERO_SLIDES[current];
  if (!slide) return <section aria-hidden="true" className="min-h-[78svh] bg-[#0e2c62]" />;

  const primaryCta = slide.primaryCta ?? DEFAULT_HERO_CTAS.primary;
  const secondaryCta = slide.secondaryCta ?? DEFAULT_HERO_CTAS.secondary;
  const animate = !reducedMotion;

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Destaques da Mira Distribuidora"
      className="relative flex min-h-[78svh] w-full items-center overflow-hidden bg-[#0e2c62]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") prev();
        else if (event.key === "ArrowRight") next();
      }}
    >
      {/* Camada de fundo (parallax). Overscan p/ não abrir vão ao deslocar. */}
      <div
        ref={parallaxRef}
        className="absolute inset-x-0 -top-[16%] h-[132%] will-change-transform"
      >
        {HERO_SLIDES.map((item, index) => {
          const isActive = index === current;
          return (
            <div
              key={item.id}
              aria-hidden="true"
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-out",
                isActive ? "opacity-100" : "opacity-0",
              )}
            >
              {/* Camada Ken Burns (zoom lento no slide ativo). */}
              <div className={cn("absolute inset-0", isActive && animate && "hero-ken-burns")}>
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? ""}
                    fill
                    priority={index === 0}
                    quality={90}
                    // 116vw compensa o zoom do Ken Burns (até 1.16x): o navegador
                    // busca uma fonte ~16% maior, evitando o borrão do upscale.
                    sizes="116vw"
                    className="object-cover object-center"
                  />
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{ backgroundImage: item.gradient ?? BRAND_HERO_GRADIENT }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overlay discreto — azul da marca (#17479e escurecido) para leitura +
          leve acento vermelho (#ed1c24). Mantém a fotografia visível. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(9,26,62,0.74) 0%, rgba(11,31,74,0.40) 46%, rgba(14,44,98,0.18) 100%), linear-gradient(to right, rgba(9,26,62,0.78) 0%, rgba(9,26,62,0.30) 50%, rgba(9,26,62,0) 82%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(56% 60% at 100% 0%, rgba(237,28,36,0.18) 0%, rgba(237,28,36,0) 58%), radial-gradient(48% 60% at 0% 100%, rgba(237,28,36,0.10) 0%, rgba(237,28,36,0) 55%)",
        }}
      />

      {/* Conteúdo sobreposto ao banner — coluna única, foco no banner. O bloco
          de texto (key={current}) reanima a cada slide; botões e selos são
          fixos (montam uma vez). */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-6 pt-28 pb-24 lg:px-10">
        <div className="max-w-2xl text-white">
          <div key={current}>
            <div className={cn("mb-5 flex items-center gap-3", animate && "hero-in-left")}>
              <span className="bg-brand h-px w-10" />
              <span className="text-xs font-semibold tracking-[0.32em] text-white/75 uppercase sm:text-sm">
                {slide.eyebrow}
              </span>
            </div>

            <h1
              className={cn(
                "font-display text-4xl leading-[1.07] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] xl:text-6xl",
                animate && "hero-in-left",
              )}
              style={animate ? { animationDelay: "0.1s" } : undefined}
            >
              {slide.title}
            </h1>

            <p
              className={cn(
                "mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg",
                animate && "hero-in-up",
              )}
              style={animate ? { animationDelay: "0.32s" } : undefined}
            >
              {slide.description}
            </p>
          </div>

          <div
            className={cn("mt-7 flex flex-wrap items-center gap-4", animate && "hero-in-up")}
            style={animate ? { animationDelay: "0.5s" } : undefined}
          >
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90 shadow-brand/25 hover:shadow-brand/40 h-12 rounded-full px-7 text-base font-semibold shadow-lg transition-all hover:-translate-y-0.5"
            >
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/40 bg-white/5 px-7 text-base font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/15 hover:text-white"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </div>

          <ul
            className={cn(
              "mt-8 grid max-w-xl grid-cols-2 gap-x-6 gap-y-3 border-t border-white/15 pt-6",
              animate && "hero-in-up",
            )}
            style={animate ? { animationDelay: "0.62s" } : undefined}
          >
            {HERO_TRUST_BADGES.map((badge) => {
              const Icon = TRUST_ICONS[badge.icon];
              return (
                <li key={badge.label} className="flex items-center gap-2.5 text-sm text-white/80">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5">
                    <Icon className="text-brand size-4" aria-hidden="true" />
                  </span>
                  <span className="font-medium">{badge.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Setas de navegação — discretas (tablet+). */}
      <button
        type="button"
        onClick={prev}
        aria-label="Slide anterior"
        className="absolute top-1/2 left-4 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:flex lg:left-6"
      >
        <ChevronLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Próximo slide"
        className="absolute top-1/2 right-4 z-30 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:flex lg:right-6"
      >
        <ChevronRight className="size-5" />
      </button>

      {/* Indicadores (bolinhas) — navegação manual discreta, centralizada. */}
      <div
        role="tablist"
        aria-label="Selecionar destaque"
        className="absolute bottom-24 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2.5 sm:bottom-28"
      >
        {HERO_SLIDES.map((item, index) => {
          const isActive = index === current;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Ir para: ${item.eyebrow}`}
              onClick={() => goTo(index)}
              className={cn(
                "h-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none",
                isActive ? "bg-brand w-8" : "w-2.5 bg-white/50 hover:bg-white/80",
              )}
            />
          );
        })}
      </div>
    </section>
  );
}
