import { prisma } from "@/lib/prisma";
import { deleteLocalUploadIfUnused } from "@/lib/storage/cleanup";
import { slugify } from "@/utils";

import type { SupplierInput } from "../schemas/supplier-schema";

/** Camada de dados/negócio de fornecedores. */

async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.supplier.findUnique({ where: { slug }, select: { id: true } });
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

export async function listSuppliers() {
  return prisma.supplier.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      order: true,
      active: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({ where: { id } });
}

/** Fornecedores ativos, para popular selects (ex.: formulário de produto). */
export async function listSupplierOptions() {
  return prisma.supplier.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function createSupplier(input: SupplierInput) {
  const slug = await generateUniqueSlug(input.name);

  return prisma.supplier.create({
    data: {
      name: input.name,
      slug,
      logoUrl: input.logoUrl,
      description: input.description,
      order: input.order,
      active: input.active,
    },
  });
}

export async function updateSupplier(id: string, input: SupplierInput) {
  const slug = await generateUniqueSlug(input.name, id);

  const existing = await prisma.supplier.findUnique({ where: { id }, select: { logoUrl: true } });

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name: input.name,
      slug,
      logoUrl: input.logoUrl ?? null,
      description: input.description ?? null,
      order: input.order,
      active: input.active,
    },
  });

  // Se o logo mudou, remove o antigo do servidor (se não usado por outro registro).
  if (existing?.logoUrl && existing.logoUrl !== (input.logoUrl ?? null)) {
    await deleteLocalUploadIfUnused(existing.logoUrl);
  }

  return supplier;
}

export async function deleteSupplier(id: string): Promise<void> {
  // Product → Supplier usa onDelete: SetNull, então excluir um fornecedor
  // apenas desvincula os produtos (não os remove). Exclusão sempre permitida.
  const supplier = await prisma.supplier.findUnique({
    where: { id },
    select: { logoUrl: true },
  });

  await prisma.supplier.delete({ where: { id } });

  await deleteLocalUploadIfUnused(supplier?.logoUrl);
}
