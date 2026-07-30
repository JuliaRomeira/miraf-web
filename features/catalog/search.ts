/**
 * Tipos e constantes da busca global do catálogo.
 *
 * Este módulo é livre de dependências de servidor (não importa Prisma), então
 * pode ser consumido tanto pelo service (servidor) quanto pelos componentes de
 * busca no cliente (cabeçalho / menu mobile) sem arrastar o Prisma para o
 * bundle do navegador.
 */

/** Nº mínimo de caracteres para disparar a busca (evita ruído/consultas amplas). */
export const SEARCH_MIN_LENGTH = 2;

/** Sugestão de produto na busca global (autocomplete do cabeçalho). */
export interface SearchProductSuggestion {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly sku: string | null;
  readonly imageUrl: string | null;
  readonly categoryName: string;
}

/** Sugestão de categoria ou fornecedor na busca global. */
export interface SearchTaxonomySuggestion {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
}

export interface CatalogSearchResult {
  readonly products: readonly SearchProductSuggestion[];
  readonly categories: readonly SearchTaxonomySuggestion[];
  readonly suppliers: readonly SearchTaxonomySuggestion[];
}
