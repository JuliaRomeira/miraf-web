import { HomeHero } from "@/components/home/home-hero";
import { HomeSegments } from "@/components/home/home-segments";
import { HomeStats } from "@/components/home/home-stats";
import { HomeHowItWorks } from "@/components/home/home-how-it-works";
import { HomeSuppliers } from "@/components/home/home-suppliers";

/**
 * Página inicial (primeiro contato). Sequência: hero (slider full-screen) →
 * fornecedores parceiros (carrossel) → compre por segmento → como funciona a
 * cotação → números (prova social) → rodapé.
 *
 * O hero é um slider institucional (`HomeHero`); o conteúdo de cada slide vive
 * em `components/home/hero-slides.ts`. Sobre o hero, o cabeçalho fica
 * transparente e vira sólido ao rolar (ver `SiteHeader`).
 */
export default function HomePage(): React.ReactElement {
  return (
    <>
      <HomeHero />

      <HomeSuppliers />

      <HomeSegments />

      <HomeHowItWorks />

      <HomeStats />
    </>
  );
}
