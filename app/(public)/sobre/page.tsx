import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Headset, History, MapPin, Truck, Users, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Quem Somos",
  description:
    "Desde 1982, a Mira Distribuidora é referência na distribuição de produtos para panificação, confeitaria e food service, atendendo mais de 500 municípios em todo o estado de São Paulo.",
};

interface AboutStat {
  readonly icon: LucideIcon;
  readonly value: string;
  readonly label: string;
}

const ABOUT_STATS: readonly AboutStat[] = [
  { icon: History, value: "+40 anos", label: "de história, desde 1982" },
  { icon: MapPin, value: "+500", label: "municípios atendidos em São Paulo" },
  { icon: Headset, value: "Atendimento", label: "consultivo e especializado" },
  { icon: Users, value: "+200", label: "colaboradores" },
  {
    icon: Building2,
    value: "3 unidades",
    label: "no interior de São Paulo",
  },
  { icon: Truck, value: "Frota própria", label: "entregas com rapidez e confiabilidade" },
];

/**
 * Página institucional "Quem Somos" (`/sobre`) — direção Moderno.
 * Hero em azul da marca com imagem, números em grade, história em duas colunas,
 * frase de destaque e chamada final. Conteúdo estático (não gerenciável).
 */
export default function AboutPage(): React.ReactElement {
  return (
    <>
      {/* HERO institucional — mesmo CONCEITO do hero da home: imagem de fundo
          full-width + overlay escuro + texto sobreposto à esquerda (não é cópia).
          Altura mantida ~igual à versão em duas colunas (lg:min-h-[600px] no
          desktop; no mobile o texto dirige a altura, como antes). Base azul da
          marca (#0e2c62) como fallback enquanto a imagem carrega. */}
      <section className="text-primary-foreground relative flex items-start overflow-hidden bg-[#0e2c62] lg:min-h-[600px]">
        {/* Imagem de fundo full-bleed. object-position um pouco à direita/baixo
            para tirar o bolo principal de trás do título (composição equilibrada). */}
        <Image
          src="/images/hero/sobre-historia.png"
          alt="Variedade de pães artesanais, bolos e doces sobre a bancada de uma cozinha profissional"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_40%]"
        />
        {/* Overlay escuro (azul da marca) — gradiente no estilo da home: ~78–80%
            à esquerda (contraste do texto) descendo a ~48% à direita (destaca os
            produtos). Escurecimento vertical bem sutil, só para o rodapé. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(9,26,62,0.90) 0%, rgba(9,26,62,0.72) 50%, rgba(9,26,62,0.50) 100%), linear-gradient(to top, rgba(9,26,62,0.30) 0%, rgba(9,26,62,0.08) 45%, rgba(9,26,62,0) 100%)",
          }}
        />
        {/* Leve acento vermelho no canto superior-direito (identidade da home). */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(56% 62% at 100% 0%, rgba(237,28,36,0.14) 0%, rgba(237,28,36,0) 58%)",
          }}
        />
        {/* Conteúdo sobreposto — alinhado à esquerda. Empurrado um pouco para
            baixo (pt) para dar respiro em relação à navbar, mantendo a altura. */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-24 pb-12 lg:pt-36 lg:pb-12">
          <div className="max-w-[640px] space-y-6">
            <div className="space-y-3">
              <p className="font-mono text-sm font-semibold tracking-[0.3em] text-white/80 uppercase">
                Quem somos · Desde 1982
              </p>
              <div className="bg-brand h-1 w-24 rounded-full" aria-hidden />
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-balance sm:text-6xl">
              Distribuindo qualidade e confiança
            </h1>
            <p className="max-w-[620px] text-lg leading-relaxed text-white/85 sm:text-xl sm:leading-9">
              Há mais de quatro décadas, a Mira Distribuidora conecta qualidade, agilidade e as
              melhores marcas do mercado para atender padarias, confeitarias e negócios de
              alimentação em todo o estado de São Paulo.
            </p>
          </div>
        </div>
      </section>

      {/* Números — sobe levemente sobre o hero (conceito da Home) para suavizar
          a transição, sem alterar a altura do hero. */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-16 lg:-mt-12 lg:pt-6 lg:pb-20">
        <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:gap-6">
          {ABOUT_STATS.map(({ icon: Icon, value, label }) => (
            <li
              key={value}
              className="border-border bg-card flex flex-col gap-3 rounded-2xl border p-7 lg:p-8"
            >
              <Icon className="text-primary size-8" />
              <p className="font-display text-primary text-3xl font-extrabold tracking-tight sm:text-4xl">
                {value}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed text-balance sm:text-base">
                {label}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Nossa história */}
      <section className="mx-auto grid max-w-7xl gap-12 px-6 py-12 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:py-16">
        <div>
          <div className="bg-brand mb-6 h-1.5 w-16 rounded-full" aria-hidden />
          <h2 className="font-display mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
            Nossa história
          </h2>
          <div className="text-muted-foreground max-w-2xl space-y-5 text-lg leading-8">
            <p>
              A evolução sempre fez parte da essência da Mira. Investimos continuamente no
              desenvolvimento dos colaboradores, na modernização da infraestrutura e no
              aprimoramento da logística para um atendimento cada vez mais ágil, seguro e eficiente.
            </p>
            <p>
              Nossa atuação é sustentada por{" "}
              <Link
                href={ROUTES.units}
                className="text-foreground font-medium underline-offset-4 hover:underline"
              >
                três unidades estrategicamente localizadas
              </Link>{" "}
              em São João da Boa Vista, Ribeirão Preto e São José do Rio Preto, permitindo ampla
              cobertura regional e entregas com rapidez e confiabilidade.
            </p>
            <p>
              Mais do que distribuir produtos, buscamos construir relacionamentos duradouros —
              oferecendo soluções que contribuam para o crescimento de cada cliente.
            </p>
          </div>
        </div>
        {/* Fachada da Mira — proporção natural (2:1), sem corte. Mesmas
            propriedades da imagem do hero: sombra suave + borda discreta + cantos
            arredondados (shadow-2xl shadow-black/40 ring-1 ring-white/10). */}
        <Image
          src="/images/hero/fachada_hd.jpeg"
          alt="Fachada da Mira Distribuidora"
          width={2880}
          height={1440}
          sizes="(min-width: 1024px) 440px, 100vw"
          className="hidden h-auto w-full self-center rounded-2xl shadow-2xl ring-1 shadow-black/40 ring-white/10 lg:block"
        />
      </section>

      {/* Frase de destaque */}
      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <blockquote className="bg-accent/50 border-border relative overflow-hidden rounded-2xl border p-10 pl-12 sm:p-12 sm:pl-16">
          <span className="bg-brand absolute inset-y-4 left-4 w-2 rounded-full" aria-hidden />
          <p className="font-display text-foreground text-2xl leading-snug font-semibold tracking-tight text-balance sm:text-3xl">
            Na Mira, qualidade, parceria e confiança caminham juntas há mais de 40 anos,
            fortalecendo negócios e impulsionando o sucesso de quem escolhe crescer conosco.
          </p>
        </blockquote>
      </section>

      {/* Chamada final */}
      <section className="mx-auto max-w-7xl px-6 pt-4 pb-20 lg:pt-8 lg:pb-28">
        <div className="bg-primary text-primary-foreground flex flex-col items-start gap-8 rounded-[24px] p-10 sm:flex-row sm:items-center sm:justify-between sm:p-14">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              Vamos crescer juntos?
            </p>
            <p className="mt-3 text-lg text-white/75">
              Conheça o portfólio e monte sua cotação em poucos cliques.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-4">
            <Button
              asChild
              size="lg"
              className="bg-brand text-brand-foreground hover:bg-brand/90 h-14 rounded-full px-8 text-base font-semibold"
            >
              <Link href={ROUTES.products}>Ver produtos</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 rounded-full border-white/30 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
            >
              <Link href={ROUTES.units}>Nossas unidades</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
