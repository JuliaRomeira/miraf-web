import { revalidatePath, revalidateTag } from "next/cache";

import { ROUTES } from "@/constants";

/**
 * Tag do data cache (`unstable_cache`) das consultas públicas do catálogo
 * (listagem de produtos, árvore de categorias, fornecedores e busca — em
 * `features/catalog/services/catalog-service.ts`). Revalidá-la invalida esse
 * cache sob demanda.
 */
export const CATALOG_CACHE_TAG = "catalog";

/**
 * Revalida o catálogo público após uma mutação no painel (produto, categoria,
 * subcategoria ou fornecedor). Duas camadas:
 *  - `revalidateTag(CATALOG_CACHE_TAG)`: esvazia o DATA CACHE das consultas de
 *    listagem/busca (senão elas serviriam dados velhos por até 1h).
 *  - `revalidatePath(...)`: esvazia o cache de PÁGINA (a home e `/categorias`
 *    são estáticas/ISR; `/produtos/[slug]` é ISR). `/produtos` é dinâmica, mas
 *    é revalidada por garantia.
 * Assim, salvar no painel reflete no site na hora.
 */
export function revalidatePublicCatalog(): void {
  revalidateTag(CATALOG_CACHE_TAG);
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.categories);
  revalidatePath(ROUTES.products);
  revalidatePath("/produtos/[slug]", "page");
}
