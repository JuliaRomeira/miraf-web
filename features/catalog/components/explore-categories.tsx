import { HomeSegmentsCarousel, type HomeSegment } from "@/components/home/home-segments-carousel";
import { listActiveCategoryTree } from "@/features/catalog/services/catalog-service";

/**
 * Seção "Explore outras categorias" (fim da página de detalhe). Em vez de
 * recomendar produtos específicos, incentiva o usuário a continuar navegando
 * pelo catálogo através das categorias disponíveis.
 *
 * Server Component: busca as categorias raiz ativas, exclui a categoria do
 * produto atual (são "outras") e reaproveita o carrossel de segmentos da home
 * (mesmos cards clicáveis → `/produtos?categoria=slug`). Sem outras categorias,
 * não renderiza nada.
 */
export async function ExploreCategories({
  currentCategorySlug,
}: {
  readonly currentCategorySlug?: string;
}): Promise<React.ReactElement | null> {
  const roots = await listActiveCategoryTree();
  const others = roots.filter((root) => root.slug !== currentCategorySlug);
  if (others.length === 0) return null;

  const segments: HomeSegment[] = others.map((root) => ({
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
    <section className="border-border mt-16 border-t pt-10">
      <h2 className="text-xl font-semibold tracking-tight">Explore outras categorias</h2>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">
        Continue navegando pelo catálogo e descubra mais produtos.
      </p>
      <HomeSegmentsCarousel segments={segments} />
    </section>
  );
}
