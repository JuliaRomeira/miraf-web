import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { deleteLocalUploadIfUnused } from "@/lib/storage/cleanup";
import { slugify } from "@/utils";

import type {
  NutritionInput,
  ProductFlavorInput,
  ProductImageInput,
  ProductInput,
} from "../schemas/product-schema";

/**
 * Camada de dados/negócio de produtos. As Server Actions validam a entrada e
 * delegam para estas funções.
 */

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { slug }, select: { id: true } });
  return existing !== null && existing.id !== excludeId;
}

async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;
  while (await isSlugTaken(candidate, excludeId)) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

async function assertSkuAvailable(sku: string, excludeId?: string): Promise<void> {
  const existing = await prisma.product.findUnique({ where: { sku }, select: { id: true } });
  if (existing !== null && existing.id !== excludeId) {
    throw new Error(`O SKU "${sku}" já está em uso por outro produto.`);
  }
}

/**
 * Resolve a subcategoria do produto: garante que ela existe e é filha da
 * categoria principal informada. Retorna o id validado ou `null` (sem
 * subcategoria). Evita salvar uma subcategoria que não pertence à categoria.
 */
async function resolveSubcategoryId(
  categoryId: string,
  subcategoryId: string | undefined,
): Promise<string | null> {
  if (!subcategoryId) {
    return null;
  }
  const sub = await prisma.category.findUnique({
    where: { id: subcategoryId },
    select: { parentId: true },
  });
  if (!sub || sub.parentId !== categoryId) {
    throw new Error("A subcategoria selecionada não pertence à categoria escolhida.");
  }
  return subcategoryId;
}

/** Normaliza a galeria: capa única e ordem sequencial pela posição. */
function normalizeImages(
  images: readonly ProductImageInput[],
): { url: string; isPrimary: boolean; order: number }[] {
  if (images.length === 0) {
    return [];
  }
  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const target = primaryIndex === -1 ? 0 : primaryIndex;
  return images.map((image, index) => ({
    url: image.url,
    isPrimary: index === target,
    order: index,
  }));
}

/**
 * Dados de `NutritionFacts` sem a relação de dono (nem `product` nem `flavor`),
 * assim o mesmo payload serve tanto para a tabela do produto quanto para a de
 * um sabor.
 */
type NutritionFactsData = Omit<Prisma.NutritionFactsCreateWithoutProductInput, "flavor">;

/**
 * Monta o `create` aninhado de `NutritionFacts` a partir da entrada validada.
 * Descarta linhas sem nenhum valor preenchido (mandatórias não usadas), e só
 * grava rótulo/unidade próprios nas linhas `OTHER` (os obrigatórios têm rótulo
 * canônico no código). `null` = sem tabela.
 */
function buildNutritionCreate(nutrition: NutritionInput | null): NutritionFactsData | undefined {
  if (!nutrition) {
    return undefined;
  }

  const rows = nutrition.rows
    .filter(
      (row) =>
        row.valuePer100 !== null || row.valuePerServing !== null || row.dailyValuePercent !== null,
    )
    .map((row, index) => ({
      kind: row.kind,
      // Rótulo/unidade são guardados para qualquer linha — o admin pode
      // personalizar até os obrigatórios (a exibição cai no canônico se vazio).
      label: row.label ?? null,
      unit: row.unit ?? null,
      valuePer100: row.valuePer100,
      valuePerServing: row.valuePerServing,
      dailyValuePercent: row.dailyValuePercent,
      order: index,
    }));

  return {
    servingsPerPackage: nutrition.servingsPerPackage ?? null,
    servingAmount: nutrition.servingAmount,
    servingHousehold: nutrition.servingHousehold ?? null,
    referenceAmount: nutrition.referenceAmount,
    rows: rows.length > 0 ? { create: rows } : undefined,
  };
}

/** Variações válidas (com nome), na ordem informada — base para alinhar imagens. */
function validFlavors(flavors: readonly ProductFlavorInput[]): ProductFlavorInput[] {
  return flavors.filter((flavor) => flavor.name.trim() !== "");
}

/**
 * Variações na ordem informada (SEM as imagens — a galeria é criada à parte, pois
 * cada `ProductImage` precisa do `productId`, indisponível no create aninhado do
 * sabor). Monta a tabela nutricional própria de cada variação (quando houver).
 */
function buildFlavorsCreate(
  flavors: readonly ProductFlavorInput[],
): Prisma.ProductFlavorCreateWithoutProductInput[] {
  return validFlavors(flavors).map((flavor, index) => {
    const nutrition = buildNutritionCreate(flavor.nutrition);
    return {
      name: flavor.name.trim(),
      sku: flavor.sku ?? null,
      weight: flavor.weight ?? null,
      description: flavor.description ?? null,
      technicalSheetUrl: flavor.technicalSheetUrl ?? null,
      available: flavor.available,
      order: index,
      nutrition: nutrition ? { create: nutrition } : undefined,
    };
  });
}

/**
 * Linhas de `ProductImage` da galeria de cada variação, alinhando as variações
 * criadas (ordenadas) com a entrada válida (mesma ordem). Cada imagem recebe
 * `productId` + `flavorId`.
 */
function buildFlavorImageRows(
  productId: string,
  createdFlavors: readonly { id: string }[],
  inputFlavors: readonly ProductFlavorInput[],
): Prisma.ProductImageCreateManyInput[] {
  const valid = validFlavors(inputFlavors);
  const rows: Prisma.ProductImageCreateManyInput[] = [];
  createdFlavors.forEach((flavor, index) => {
    const images = normalizeImages(valid[index]?.images ?? []);
    for (const image of images) {
      rows.push({
        productId,
        flavorId: flavor.id,
        url: image.url,
        isPrimary: image.isPrimary,
        order: image.order,
      });
    }
  });
  return rows;
}

/** Itens por página na listagem do painel de produtos. */
const ADMIN_PRODUCTS_PER_PAGE = 20;

export interface ListProductsParams {
  readonly q?: string;
  readonly status?: Prisma.ProductWhereInput["status"];
  readonly page?: number;
}

/**
 * Listagem paginada de produtos para o painel, com busca (nome ou SKU) e filtro
 * de status opcionais. Paginação/filtros no servidor — a tabela não cresce sem
 * limite conforme o catálogo aumenta.
 */
export async function listProducts(params: ListProductsParams = {}) {
  const page = Math.max(1, params.page ?? 1);
  const perPage = ADMIN_PRODUCTS_PER_PAGE;

  const where: Prisma.ProductWhereInput = {};
  if (params.status) {
    where.status = params.status;
  }
  const term = params.q?.trim();
  if (term) {
    where.OR = [
      { name: { contains: term, mode: "insensitive" } },
      { sku: { contains: term, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        status: true,
        featured: true,
        category: { select: { name: true } },
        supplier: { select: { name: true } },
        // Capa da lista: capa do produto se houver, senão qualquer imagem (inclui
        // as de variação — produtos com variações não têm imagem de nível produto).
        images: {
          take: 1,
          orderBy: [{ isPrimary: "desc" }, { order: "asc" }],
          select: { url: true },
        },
        _count: { select: { images: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      // Galeria de nível do produto (sem variação).
      images: { where: { flavorId: null }, orderBy: { order: "asc" } },
      flavors: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          images: { orderBy: { order: "asc" } },
          nutrition: { include: { rows: { orderBy: { order: "asc" } } } },
        },
      },
      nutrition: { include: { rows: { orderBy: { order: "asc" } } } },
      relatedProducts: { select: { id: true } },
    },
  });
}

/**
 * Opções de produtos para o seletor de "produtos relacionados" (todos, menos o
 * próprio, quando editando). Só id/nome — leve o suficiente para o form.
 */
export async function listProductOptions(excludeId?: string) {
  return prisma.product.findMany({
    where: excludeId ? { id: { not: excludeId } } : undefined,
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

/** Normaliza a lista de relacionados: remove o próprio id e duplicatas. */
function normalizeRelatedIds(ids: readonly string[], selfId?: string): string[] {
  return Array.from(new Set(ids.filter((id) => id && id !== selfId)));
}

export async function createProduct(input: ProductInput) {
  const slug = await generateUniqueSlug(input.name);
  if (input.sku) {
    await assertSkuAvailable(input.sku);
  }
  const subcategoryId = await resolveSubcategoryId(input.categoryId, input.subcategoryId);
  const images = normalizeImages(input.images);
  const flavors = buildFlavorsCreate(input.flavors);
  // Tabela do produto = tabela geral (fallback exibido quando o sabor não tem a
  // sua própria). Preservada mesmo com sabores.
  const nutrition = buildNutritionCreate(input.nutrition);

  const highlights = input.highlights.map((item) => item.trim()).filter((item) => item !== "");
  const relatedIds = normalizeRelatedIds(input.relatedProductIds);

  return prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        name: input.name,
        slug,
        description: input.description,
        shortDescription: input.shortDescription,
        composition: input.composition,
        application: input.application,
        conservation: input.conservation,
        preparation: input.preparation,
        technicalSheetUrl: input.technicalSheetUrl,
        highlights,
        weight: input.weight,
        sku: input.sku,
        packaging: input.packaging,
        saleUnit: input.saleUnit,
        status: input.status,
        featured: input.featured,
        order: input.order,
        categoryId: input.categoryId,
        subcategoryId,
        supplierId: input.supplierId,
        images: images.length > 0 ? { create: images } : undefined,
        flavors: flavors.length > 0 ? { create: flavors } : undefined,
        nutrition: nutrition ? { create: nutrition } : undefined,
        relatedProducts:
          relatedIds.length > 0 ? { connect: relatedIds.map((id) => ({ id })) } : undefined,
      },
      include: {
        flavors: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } },
      },
    });

    // Galeria de cada variação (ProductImage com productId + flavorId).
    const flavorImages = buildFlavorImageRows(created.id, created.flavors, input.flavors);
    if (flavorImages.length > 0) {
      await tx.productImage.createMany({ data: flavorImages });
    }

    return created;
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const slug = await generateUniqueSlug(input.name, id);
  if (input.sku) {
    await assertSkuAvailable(input.sku, id);
  }
  const subcategoryId = await resolveSubcategoryId(input.categoryId, input.subcategoryId);
  const images = normalizeImages(input.images);
  const flavors = buildFlavorsCreate(input.flavors);
  // Tabela do produto = tabela geral (fallback exibido quando o sabor não tem a
  // sua própria). Preservada mesmo com sabores.
  const nutrition = buildNutritionCreate(input.nutrition);
  const highlights = input.highlights.map((item) => item.trim()).filter((item) => item !== "");
  const relatedIds = normalizeRelatedIds(input.relatedProductIds, id);

  // Imagens/fichas atuais, para limpar do disco as que forem removidas. As
  // imagens de variação também são `ProductImage` (com productId), então
  // `previousImages` já as cobre.
  const [previousImages, previousFlavors, previousProduct] = await Promise.all([
    prisma.productImage.findMany({ where: { productId: id }, select: { url: true } }),
    prisma.productFlavor.findMany({
      where: { productId: id },
      select: { technicalSheetUrl: true },
    }),
    prisma.product.findUnique({ where: { id }, select: { technicalSheetUrl: true } }),
  ]);

  // Substitui galeria (produto + variações), sabores e tabela nutricional de
  // forma atômica. `productImage.deleteMany({productId})` remove TODAS as imagens
  // (nível produto e de variação); os sabores e suas tabelas somem no deleteMany
  // seguinte; a tabela do produto é removida explicitamente.
  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productFlavor.deleteMany({ where: { productId: id } });
    await tx.nutritionFacts.deleteMany({ where: { productId: id } });
    const updated = await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug,
        description: input.description,
        shortDescription: input.shortDescription ?? null,
        composition: input.composition ?? null,
        application: input.application ?? null,
        conservation: input.conservation ?? null,
        preparation: input.preparation ?? null,
        technicalSheetUrl: input.technicalSheetUrl ?? null,
        highlights,
        weight: input.weight ?? null,
        sku: input.sku ?? null,
        packaging: input.packaging ?? null,
        saleUnit: input.saleUnit,
        status: input.status,
        featured: input.featured,
        order: input.order,
        categoryId: input.categoryId,
        subcategoryId,
        supplierId: input.supplierId ?? null,
        images: images.length > 0 ? { create: images } : undefined,
        flavors: flavors.length > 0 ? { create: flavors } : undefined,
        nutrition: nutrition ? { create: nutrition } : undefined,
        // `set` substitui a lista inteira de relacionados (inclusive esvazia).
        relatedProducts: { set: relatedIds.map((id) => ({ id })) },
      },
      include: {
        flavors: { orderBy: [{ order: "asc" }, { createdAt: "asc" }], select: { id: true } },
      },
    });

    const flavorImages = buildFlavorImageRows(updated.id, updated.flavors, input.flavors);
    if (flavorImages.length > 0) {
      await tx.productImage.createMany({ data: flavorImages });
    }

    return updated;
  });

  // Remove do servidor os arquivos que deixaram de ser referenciados.
  await Promise.all([
    ...previousImages.map((image) => deleteLocalUploadIfUnused(image.url)),
    ...previousFlavors.map((flavor) => deleteLocalUploadIfUnused(flavor.technicalSheetUrl)),
    deleteLocalUploadIfUnused(previousProduct?.technicalSheetUrl),
  ]);

  return product;
}

export async function deleteProduct(id: string): Promise<void> {
  const quoteItemCount = await prisma.quoteItem.count({ where: { productId: id } });
  if (quoteItemCount > 0) {
    throw new Error(
      `Não é possível excluir: o produto está em ${quoteItemCount} cotação(ões). Considere marcá-lo como inativo.`,
    );
  }

  const [images, flavors, product] = await Promise.all([
    // Inclui imagens de nível produto e de variação (todas têm productId).
    prisma.productImage.findMany({ where: { productId: id }, select: { url: true } }),
    prisma.productFlavor.findMany({
      where: { productId: id },
      select: { technicalSheetUrl: true },
    }),
    prisma.product.findUnique({ where: { id }, select: { technicalSheetUrl: true } }),
  ]);

  await prisma.product.delete({ where: { id } }); // cascade remove ProductImage/ProductFlavor

  await Promise.all([
    ...images.map((image) => deleteLocalUploadIfUnused(image.url)),
    ...flavors.map((flavor) => deleteLocalUploadIfUnused(flavor.technicalSheetUrl)),
    deleteLocalUploadIfUnused(product?.technicalSheetUrl),
  ]);
}
