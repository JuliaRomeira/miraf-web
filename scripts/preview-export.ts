/**
 * Exporta os dados do catálogo do banco de DEV para um JSON versionável
 * (`prisma/preview-seed.json`), para popular o banco do preview (Vercel + Neon).
 *
 * Preserva IDs e relações. NÃO exporta cotações (Quote/QuoteItem) — o preview é
 * só para o cliente visualizar o catálogo; dados de teste de cotação ficam de fora.
 *
 * Uso (contra o banco de dev, definido no .env):
 *   npx tsx --env-file=.env scripts/preview-export.ts
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main(): Promise<void> {
  const [settings, users, categories, suppliers, products] = await Promise.all([
    prisma.settings.findMany(),
    prisma.user.findMany(),
    prisma.category.findMany(),
    prisma.supplier.findMany(),
    prisma.product.findMany({
      include: {
        images: true,
        flavors: { include: { images: true, nutrition: { include: { rows: true } } } },
        nutrition: { include: { rows: true } },
        relatedProducts: { select: { id: true } },
      },
    }),
  ]);

  // Serializa Decimais como string (preserva precisão no JSON).
  const decimal = (v: unknown): string | null => (v === null || v === undefined ? null : String(v));

  const mapRows = (
    rows: {
      id: string;
      kind: string;
      label: string | null;
      unit: string | null;
      valuePer100: unknown;
      valuePerServing: unknown;
      dailyValuePercent: number | null;
      order: number;
    }[],
  ) =>
    rows.map((r) => ({
      id: r.id,
      kind: r.kind,
      label: r.label,
      unit: r.unit,
      valuePer100: decimal(r.valuePer100),
      valuePerServing: decimal(r.valuePerServing),
      dailyValuePercent: r.dailyValuePercent,
      order: r.order,
    }));

  const mapNutrition = (
    n:
      | {
          id: string;
          servingsPerPackage: string | null;
          servingAmount: string;
          servingHousehold: string | null;
          referenceAmount: string;
          footnote: string | null;
          rows: Parameters<typeof mapRows>[0];
        }
      | null
      | undefined,
  ) =>
    n
      ? {
          id: n.id,
          servingsPerPackage: n.servingsPerPackage,
          servingAmount: n.servingAmount,
          servingHousehold: n.servingHousehold,
          referenceAmount: n.referenceAmount,
          footnote: n.footnote,
          rows: mapRows(n.rows),
        }
      : null;

  const data = {
    exportedAt: new Date().toISOString(),
    settings: settings.map((s) => ({ key: s.key, value: s.value, description: s.description })),
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      password: u.password,
      role: u.role,
      active: u.active,
    })),
    categories: categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      bannerUrl: c.bannerUrl,
      order: c.order,
      active: c.active,
      parentId: c.parentId,
    })),
    suppliers: suppliers.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      logoUrl: s.logoUrl,
      description: s.description,
      order: s.order,
      active: s.active,
    })),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      composition: p.composition,
      application: p.application,
      conservation: p.conservation,
      preparation: p.preparation,
      technicalSheetUrl: p.technicalSheetUrl,
      highlights: p.highlights,
      weight: p.weight,
      sku: p.sku,
      packaging: p.packaging,
      saleUnit: p.saleUnit,
      status: p.status,
      featured: p.featured,
      order: p.order,
      metaTitle: p.metaTitle,
      metaDescription: p.metaDescription,
      categoryId: p.categoryId,
      subcategoryId: p.subcategoryId,
      supplierId: p.supplierId,
      createdAt: p.createdAt.toISOString(),
      relatedProductIds: p.relatedProducts.map((r) => r.id),
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.alt,
        order: img.order,
        isPrimary: img.isPrimary,
        flavorId: img.flavorId,
      })),
      flavors: p.flavors.map((f) => ({
        id: f.id,
        name: f.name,
        imageUrl: f.imageUrl,
        sku: f.sku,
        description: f.description,
        weight: f.weight,
        technicalSheetUrl: f.technicalSheetUrl,
        available: f.available,
        order: f.order,
        nutrition: mapNutrition(f.nutrition),
      })),
      nutrition: mapNutrition(p.nutrition),
    })),
  };

  const outPath = resolve(process.cwd(), "prisma", "preview-seed.json");
  writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

  console.log("Exportado para prisma/preview-seed.json");
  console.log(
    `  settings=${data.settings.length} users=${data.users.length} categories=${data.categories.length} suppliers=${data.suppliers.length} products=${data.products.length}`,
  );
  const imgs = data.products.reduce((n, p) => n + p.images.length, 0);
  const flavs = data.products.reduce((n, p) => n + p.flavors.length, 0);
  console.log(`  productImages=${imgs} flavors=${flavs}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
