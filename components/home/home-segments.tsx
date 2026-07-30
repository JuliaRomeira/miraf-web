import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HomeSegmentsCarousel, type HomeSegment } from "@/components/home/home-segments-carousel";
import { listActiveCategoryTree } from "@/features/catalog/services/catalog-service";
import { ROUTES } from "@/constants";

/**
 * Seção "Compre por segmento" — ajuda o visitante a chegar rápido à categoria
 * certa do catálogo (estilo da referência de UX, sem copiar).
 *
 * É DINÂMICA: cada card é uma categoria raiz **ativa** (todas aparecem, mesmo
 * sem produtos ainda). Assim, ao gerenciar as categorias no painel — inclusive
 * as 5 principais (Panificação e Confeitaria, Lácteos, etc.) — a home reflete
 * automaticamente, sem slugs quebrados. A linha de apoio lista as subcategorias.
 *
 * A apresentação é um **carrossel horizontal** (mesmo padrão do Hero Banner):
 * evita o espaço vazio quando há poucos segmentos e acomoda naturalmente novos
 * segmentos sem quebrar o layout. A renderização/navegação fica em
 * `HomeSegmentsCarousel` (client); aqui só buscamos os dados e montamos o
 * cabeçalho. Sem categoria ativa, a seção some.
 */
export async function HomeSegments(): Promise<React.ReactElement | null> {
  const roots = await listActiveCategoryTree();

  if (roots.length === 0) {
    return null;
  }

  const segments: HomeSegment[] = roots.map((root) => ({
    id: root.id,
    name: root.name,
    slug: root.slug,
    imageUrl: root.imageUrl,
    examples:
      root.children.length > 0
        ? root.children
            .slice(0, 4)
            .map((child) => child.name)
            .join(", ")
        : "Ver produtos do segmento",
  }));

  return (
    <section className="mx-auto w-full max-w-7xl min-w-0 px-6 pt-12 pb-20 lg:pt-16 lg:pb-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            Compre por segmento
          </h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Encontre rápido o que seu negócio precisa.
          </p>
        </div>
        <Link
          href={ROUTES.products}
          className="text-primary inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        >
          Ver todas as categorias
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <HomeSegmentsCarousel segments={segments} />
    </section>
  );
}
