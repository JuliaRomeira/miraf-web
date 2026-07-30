import { revalidatePath } from "next/cache";

import { ROUTES } from "@/constants";

/**
 * Revalida as páginas públicas que exibem catálogo após uma mutação no painel
 * (produto, categoria, subcategoria ou fornecedor). A home (seção "Compre por
 * segmento" e carrossel de fornecedores) e `/categorias` são renderizadas
 * estaticamente (ISR) e ficariam defasadas até o próximo ciclo de revalidação
 * sem isto. `/produtos` e `/produtos/[slug]` já são dinâmicas, mas são
 * revalidadas por garantia. Assim, salvar no painel reflete no site na hora.
 */
export function revalidatePublicCatalog(): void {
  revalidatePath(ROUTES.home);
  revalidatePath(ROUTES.categories);
  revalidatePath(ROUTES.products);
  revalidatePath("/produtos/[slug]", "page");
}
