import { cache } from "react";
import { unstable_cache } from "next/cache";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { SEARCH_MIN_LENGTH, type CatalogSearchResult } from "@/features/catalog/search";
import { CATALOG_CACHE_TAG } from "@/lib/revalidate-catalog";

/**
 * Camada de dados do catálogo público. Diferente dos services de admin,
 * expõe apenas o que é público: somente produtos/categorias/fornecedores ativos.
 *
 * PERFORMANCE — as consultas de LISTAGEM (catálogo, categorias, fornecedores,
 * busca) são cacheadas com `unstable_cache` (Vercel Data Cache). Assim a maioria
 * das visitas NÃO toca o banco (Neon), eliminando o efeito do cold start (o banco
 * serverless dormir quando ocioso). O cache é invalidado sob demanda pela tag
 * `CATALOG_CACHE_TAG` — o painel chama `revalidatePublicCatalog()` ao salvar, então
 * as edições refletem na hora. O `revalidate` abaixo é só um fallback (staleness
 * máxima caso alguma revalidação sob demanda não dispare).
 *
 * O DETALHE do produto (`getPublicProductBySlug`) também usa este data cache; os
 * `Decimal` de nutrição viram string no cache e o `buildNutritionView` os lê com
 * `Number(...)` (formatação pt-BR preservada). A rota `/produtos/[slug]` ainda
 * declara `export const revalidate` (ISR) — agora que os dados são cacheados, a
 * página pode virar estática/ISR no CDN.
 */

const PRODUCTS_PER_PAGE = 12;

/** Fallback de revalidação do data cache (1h). Edições revalidam sob demanda. */
const CATALOG_CACHE_REVALIDATE = 3600;

/** Campos de produto usados nos cards do catálogo (listagem, relacionados). */
const CATALOG_CARD_SELECT = {
  id: true,
  name: true,
  slug: true,
  saleUnit: true,
  category: { select: { name: true, slug: true } },
  supplier: { select: { name: true, slug: true } },
  // Capa do card. Prioriza a imagem de NÍVEL PRODUTO (flavorId null) — a capa
  // "oficial" (ex.: a caixa/display). Só cai para imagem de variação quando o
  // produto não tem imagem própria (produtos cuja galeria vive só nos sabores).
  // `flavorId nulls: "first"` garante isso mesmo quando produto e sabores estão
  // todos marcados como capa (isPrimary=true) — evita empate não-determinístico.
  images: {
    take: 1,
    orderBy: [
      { flavorId: { sort: "asc", nulls: "first" } },
      { isPrimary: "desc" },
      { order: "asc" },
    ],
    select: { url: true, alt: true },
  },
  _count: { select: { flavors: true } },
} satisfies Prisma.ProductSelect;

/** Ordenações disponíveis na listagem pública. */
export type CatalogSort = "relevancia" | "nome" | "recentes";

const SORT_ORDER_BY: Record<CatalogSort, Prisma.ProductOrderByWithRelationInput[]> = {
  relevancia: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
  nome: [{ name: "asc" }],
  recentes: [{ createdAt: "desc" }],
};

export interface CatalogFilters {
  q?: string;
  categorySlug?: string;
  supplierSlug?: string;
  sort?: CatalogSort;
  page?: number;
}

export const listPublicProducts = unstable_cache(
  async (filters: CatalogFilters) => {
    const page = Math.max(1, filters.page ?? 1);
    const perPage = PRODUCTS_PER_PAGE;

    // Cada filtro vira uma condição no AND (categoria e busca têm cada um seu OR
    // interno; combiná-los num AND evita que as duas chaves `OR` colidam no objeto).
    const conditions: Prisma.ProductWhereInput[] = [];

    // `?categoria=` aceita o slug de uma categoria principal OU de uma subcategoria.
    // Como `categoryId` é sempre a categoria PRINCIPAL, filtrar por uma raiz já traz
    // todos os produtos dela (com ou sem subcategoria); filtrar por uma subcategoria
    // casa em `subcategory.slug`.
    if (filters.categorySlug) {
      conditions.push({
        OR: [
          { category: { slug: filters.categorySlug } },
          { subcategory: { slug: filters.categorySlug } },
        ],
      });
    }

    if (filters.supplierSlug) {
      conditions.push({ supplier: { slug: filters.supplierSlug } });
    }

    // Busca por nome, código (SKU), descrição OU nome do fornecedor.
    if (filters.q) {
      conditions.push({
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { sku: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
          { supplier: { name: { contains: filters.q, mode: "insensitive" } } },
        ],
      });
    }

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
      ...(conditions.length > 0 ? { AND: conditions } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: SORT_ORDER_BY[filters.sort ?? "relevancia"],
        skip: (page - 1) * perPage,
        take: perPage,
        select: CATALOG_CARD_SELECT,
      }),
      prisma.product.count({ where }),
    ]);

    return { items, total, page, perPage, totalPages: Math.max(1, Math.ceil(total / perPage)) };
  },
  ["catalog:list-products"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE },
);

const EMPTY_SEARCH_RESULT: CatalogSearchResult = { products: [], categories: [], suppliers: [] };

/**
 * Busca global do site público (autocomplete): produtos (por nome ou código),
 * categorias e fornecedores. Só conteúdo ativo. Limita cada grupo para manter
 * a lista de sugestões enxuta e rápida.
 */
export const searchCatalog = unstable_cache(
  async (term: string): Promise<CatalogSearchResult> => {
    const q = term.trim();
    if (q.length < SEARCH_MIN_LENGTH) {
      return EMPTY_SEARCH_RESULT;
    }

    const insensitive = { contains: q, mode: "insensitive" } as const;

    const [products, categories, suppliers] = await Promise.all([
      prisma.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [{ name: insensitive }, { sku: insensitive }],
        },
        orderBy: [{ featured: "desc" }, { order: "asc" }, { name: "asc" }],
        take: 6,
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          category: { select: { name: true } },
          images: { where: { isPrimary: true }, take: 1, select: { url: true } },
        },
      }),
      prisma.category.findMany({
        where: { active: true, name: insensitive },
        orderBy: { name: "asc" },
        take: 4,
        select: { id: true, name: true, slug: true },
      }),
      prisma.supplier.findMany({
        where: { active: true, name: insensitive },
        orderBy: { name: "asc" },
        take: 4,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        imageUrl: product.images[0]?.url ?? null,
        categoryName: product.category.name,
      })),
      categories,
      suppliers,
    };
  },
  ["catalog:search"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE },
);

/**
 * Detalhe do produto: a query mais pesada do site (imagens + variações +
 * nutrição + relacionados). Usa `unstable_cache` (data cache) para NÃO tocar o
 * banco a cada visita — igual às listagens, protege do cold start do Neon (e,
 * sem dados "não-cacheados", permite que a rota `/produtos/[slug]` vire ISR).
 * `React.cache` por fora deduplica as duas chamadas do mesmo request
 * (`generateMetadata` + corpo).
 *
 * Sobre o `Decimal` da nutrição: é serializado como string no cache; o
 * `buildNutritionView` lê os valores com `Number(...)`, então voltam a formatar
 * em pt-BR normalmente (verificado no navegador).
 */
export const getPublicProductBySlug = cache(
  unstable_cache(
    async (slug: string) => {
      return prisma.product.findFirst({
        where: { slug, status: "ACTIVE" },
        include: {
          // Galeria de nível do produto (sem variação).
          images: { where: { flavorId: null }, orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
          flavors: {
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
            include: {
              // Galeria própria da variação (frente, verso, embalagem…).
              images: { orderBy: [{ isPrimary: "desc" }, { order: "asc" }] },
              nutrition: { include: { rows: true } },
            },
          },
          category: { select: { name: true, slug: true } },
          subcategory: { select: { name: true, slug: true } },
          supplier: { select: { name: true, slug: true } },
          nutrition: { include: { rows: true } },
          // Produtos relacionados ativos, no mesmo formato dos cards do catálogo.
          relatedProducts: {
            where: { status: "ACTIVE" },
            orderBy: [{ order: "asc" }, { name: "asc" }],
            select: CATALOG_CARD_SELECT,
          },
        },
      });
    },
    ["catalog:product-by-slug"],
    { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE },
  ),
);

/**
 * Categorias ativas do catálogo público, organizadas em dois níveis. Cada
 * categoria raiz vem com suas subcategorias ativas (`children`). Como
 * `Product.categoryId` é sempre a categoria PRINCIPAL, `root._count.products`
 * já conta TODOS os produtos ativos da raiz (com ou sem subcategoria) — é o
 * `totalActiveProducts`.
 */
export const listActiveCategoryTree = unstable_cache(
  async () => {
    const categories = await prisma.category.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        imageUrl: true,
        parentId: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    });

    const childrenByParent = new Map<string, typeof categories>();
    for (const category of categories) {
      if (category.parentId) {
        const siblings = childrenByParent.get(category.parentId) ?? [];
        siblings.push(category);
        childrenByParent.set(category.parentId, siblings);
      }
    }

    return categories
      .filter((category) => category.parentId === null)
      .map((root) => ({
        ...root,
        children: childrenByParent.get(root.id) ?? [],
        totalActiveProducts: root._count.products,
      }));
  },
  ["catalog:category-tree"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE },
);

export const listActiveSuppliers = unstable_cache(
  async () => {
    return prisma.supplier.findMany({
      where: { active: true },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        _count: { select: { products: { where: { status: "ACTIVE" } } } },
      },
    });
  },
  ["catalog:active-suppliers"],
  { tags: [CATALOG_CACHE_TAG], revalidate: CATALOG_CACHE_REVALIDATE },
);
