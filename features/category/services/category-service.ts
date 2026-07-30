import { prisma } from "@/lib/prisma";
import { deleteLocalUploadIfUnused } from "@/lib/storage/cleanup";
import { slugify } from "@/utils";

import type { CategoryInput } from "../schemas/category-schema";

/**
 * Camada de dados/negócio de categorias. As Server Actions apenas validam a
 * entrada e delegam para estas funções — nenhuma lógica de banco vive nos
 * componentes ou actions.
 */

/** Verifica se um slug já está em uso por outra categoria. */
async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  return existing !== null && existing.id !== excludeId;
}

/** Gera um slug único a partir do nome, adicionando sufixo numérico se preciso. */
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

/**
 * Categorias para a listagem do painel, já organizadas em dois níveis:
 * cada categoria raiz vem com suas subcategorias (`children`). Facilita renderizar
 * a hierarquia sem o componente precisar montar a árvore.
 */
export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      order: true,
      active: true,
      parentId: true,
      _count: { select: { products: true } },
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

  // Raiz = categoria sem pai. Cada raiz recebe suas subcategorias.
  return categories
    .filter((category) => category.parentId === null)
    .map((root) => ({
      ...root,
      children: childrenByParent.get(root.id) ?? [],
    }));
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

export interface CategoryTreeNode {
  readonly id: string;
  readonly name: string;
  readonly children: readonly { readonly id: string; readonly name: string }[];
}

/**
 * Árvore de categorias (raízes com suas subcategorias) para selects dependentes
 * — ex.: no cadastro de produto, escolher a categoria carrega só as suas
 * subcategorias, sem nova ida ao servidor. Inclui inativas (é uso do painel).
 */
export async function listCategoryTree(): Promise<CategoryTreeNode[]> {
  const tree = await listCategories();
  return tree.map((root) => ({
    id: root.id,
    name: root.name,
    children: root.children.map((child) => ({ id: child.id, name: child.name })),
  }));
}

// ---------------------------------------------------------------------------
// Subcategorias — gerenciadas DENTRO do cadastro da categoria principal (sem
// tela própria no menu). Cada subcategoria é uma Category com `parentId` de uma
// raiz; a UI só edita nome/status (descrição/imagem ficam para a categoria raiz).
// ---------------------------------------------------------------------------

/** Subcategorias de uma categoria principal, para o gerenciador embutido. */
export async function listSubcategories(parentId: string) {
  return prisma.category.findMany({
    where: { parentId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      active: true,
      _count: { select: { subcategoryProducts: true } },
    },
  });
}

/** Confirma que o id informado é uma categoria RAIZ (pode receber subcategorias). */
async function assertIsRootCategory(parentId: string): Promise<void> {
  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { parentId: true },
  });
  if (!parent) {
    throw new Error("Categoria principal inválida.");
  }
  if (parent.parentId !== null) {
    throw new Error(
      "Só categorias principais podem ter subcategorias (a hierarquia tem 2 níveis).",
    );
  }
}

export async function createSubcategory(parentId: string, name: string) {
  await assertIsRootCategory(parentId);

  const trimmed = name.trim();
  const slug = await generateUniqueSlug(trimmed);

  return prisma.category.create({
    data: { name: trimmed, slug, parentId, active: true },
  });
}

export async function updateSubcategory(id: string, data: { name: string; active: boolean }) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { parentId: true },
  });
  if (!existing || existing.parentId === null) {
    throw new Error("Subcategoria inválida.");
  }

  const trimmed = data.name.trim();
  const slug = await generateUniqueSlug(trimmed, id);

  // Só nome/slug/status — descrição, imagem e vínculo com o pai não mudam aqui.
  return prisma.category.update({
    where: { id },
    data: { name: trimmed, slug, active: data.active },
  });
}

export async function deleteSubcategory(id: string): Promise<void> {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { parentId: true, imageUrl: true },
  });
  if (!existing || existing.parentId === null) {
    throw new Error("Subcategoria inválida.");
  }

  // Produtos vinculados via `subcategoryId` são desvinculados automaticamente
  // (onDelete: SetNull) — o produto permanece na categoria principal.
  await prisma.category.delete({ where: { id } });
  await deleteLocalUploadIfUnused(existing.imageUrl);
}

/**
 * Garante o invariante de dois níveis (categoria → subcategoria):
 * - o pai escolhido precisa ser uma categoria raiz;
 * - a categoria não pode ser pai de si mesma;
 * - uma categoria que já possui subcategorias não pode virar subcategoria.
 */
async function assertValidParent(parentId: string | undefined, categoryId?: string): Promise<void> {
  if (!parentId) {
    return;
  }

  if (parentId === categoryId) {
    throw new Error("Uma categoria não pode ser subcategoria de si mesma.");
  }

  const parent = await prisma.category.findUnique({
    where: { id: parentId },
    select: { parentId: true },
  });

  if (!parent) {
    throw new Error("Categoria pai inválida.");
  }

  if (parent.parentId !== null) {
    throw new Error(
      "Só há dois níveis de categoria: a categoria selecionada já é uma subcategoria e não pode ter subcategorias.",
    );
  }

  if (categoryId) {
    const childCount = await prisma.category.count({ where: { parentId: categoryId } });
    if (childCount > 0) {
      throw new Error(
        "Esta categoria possui subcategorias e não pode virar subcategoria de outra. Mova ou exclua as subcategorias primeiro.",
      );
    }
  }
}

export async function createCategory(input: CategoryInput) {
  await assertValidParent(input.parentId);

  const slug = await generateUniqueSlug(input.name);

  return prisma.category.create({
    data: {
      name: input.name,
      slug,
      description: input.description,
      imageUrl: input.imageUrl,
      bannerUrl: input.bannerUrl,
      parentId: input.parentId,
      order: input.order,
      active: input.active,
    },
  });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const slug = await generateUniqueSlug(input.name, id);

  const existing = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true, bannerUrl: true },
  });

  // `parentId` NÃO é alterado aqui de propósito: o vínculo pai é definido só na
  // criação (createSubcategory) e nunca reparenteado pelo CategoryForm (que não
  // tem esse campo). Antes, gravar `parentId: input.parentId ?? null` promovia uma
  // subcategoria a raiz ao editá-la por esta tela (perda de vínculo silenciosa).
  const category = await prisma.category.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      description: input.description ?? null,
      imageUrl: input.imageUrl ?? null,
      bannerUrl: input.bannerUrl ?? null,
      order: input.order,
      active: input.active,
    },
  });

  // Se a imagem/banner mudaram, remove os antigos do servidor (se não usados por outro registro).
  if (existing?.imageUrl && existing.imageUrl !== (input.imageUrl ?? null)) {
    await deleteLocalUploadIfUnused(existing.imageUrl);
  }
  if (existing?.bannerUrl && existing.bannerUrl !== (input.bannerUrl ?? null)) {
    await deleteLocalUploadIfUnused(existing.bannerUrl);
  }

  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const childCount = await prisma.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new Error(
      `Não é possível excluir: há ${childCount} subcategoria(s) dentro desta categoria. Exclua ou mova as subcategorias primeiro.`,
    );
  }

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Não é possível excluir: há ${productCount} produto(s) vinculado(s) a esta categoria.`,
    );
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: { imageUrl: true, bannerUrl: true },
  });

  await prisma.category.delete({ where: { id } });

  await deleteLocalUploadIfUnused(category?.imageUrl);
  await deleteLocalUploadIfUnused(category?.bannerUrl);
}
