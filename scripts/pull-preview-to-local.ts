/**
 * Importa `prisma/preview-seed.json` para o banco LOCAL de desenvolvimento.
 *
 * É o espelho seguro do `preview-import.ts`: enquanto aquele só grava no Neon
 * (recusa localhost), este só grava em LOCALHOST (recusa qualquer outro host).
 * Assim, nunca consegue tocar no banco de produção por engano.
 *
 * Fluxo para trazer o catálogo real (editado pela cliente) para o seu dev:
 *   1) Exportar do Neon (SÓ LEITURA, não altera nada em produção):
 *        npx tsx --env-file=.env.preview scripts/preview-export.ts
 *   2) Importar no seu local (este script):
 *        npx tsx --env-file=.env scripts/pull-preview-to-local.ts
 *
 * ⚠️ SUBSTITUI o catálogo do seu dev: limpa produtos/categorias/fornecedores/
 * imagens/nutrição/cotações locais e reinsere a partir do JSON. NÃO mexe nos
 * USUÁRIOS locais (preserva o seu admin de dev — o login local continua o mesmo).
 *
 * Observação sobre imagens: o JSON traz os CAMINHOS das imagens (ex.:
 * `/uploads/products/<uuid>.png`), não os arquivos. Fotos que a cliente subiu no
 * site publicado não existem no seu `public/uploads` — aparecerão quebradas
 * localmente até você copiar os arquivos do servidor. Produtos que reusam
 * imagens já presentes no seu dev seguem normais.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const url = process.env.DATABASE_URL ?? "";
if (!url) {
  console.error("DATABASE_URL não definida. Rode com: npx tsx --env-file=.env scripts/pull-preview-to-local.ts");
  process.exit(1);
}
if (!url.includes("localhost") && !url.includes("127.0.0.1")) {
  console.error(
    "RECUSADO: DATABASE_URL NÃO aponta para localhost. Este script só importa para o banco LOCAL de dev. Use o .env local (--env-file=.env).",
  );
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

interface Row {
  id: string;
  kind: string;
  label: string | null;
  unit: string | null;
  valuePer100: string | null;
  valuePerServing: string | null;
  dailyValuePercent: number | null;
  order: number;
}
interface Nutrition {
  id: string;
  servingsPerPackage: string | null;
  servingAmount: string;
  servingHousehold: string | null;
  referenceAmount: string;
  footnote: string | null;
  rows: Row[];
}
interface SeedData {
  settings: { key: string; value: string; description: string | null }[];
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    bannerUrl: string | null;
    order: number;
    active: boolean;
    parentId: string | null;
  }[];
  suppliers: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    order: number;
    active: boolean;
  }[];
  products: {
    id: string;
    name: string;
    slug: string;
    description: string;
    shortDescription: string | null;
    composition: string | null;
    application: string | null;
    conservation: string | null;
    preparation: string | null;
    technicalSheetUrl: string | null;
    highlights: string[];
    weight: string | null;
    sku: string | null;
    packaging: string | null;
    saleUnit: string;
    status: "DRAFT" | "ACTIVE" | "INACTIVE";
    featured: boolean;
    order: number;
    metaTitle: string | null;
    metaDescription: string | null;
    categoryId: string;
    subcategoryId: string | null;
    supplierId: string | null;
    createdAt: string;
    relatedProductIds: string[];
    images: {
      id: string;
      url: string;
      alt: string | null;
      order: number;
      isPrimary: boolean;
      flavorId: string | null;
    }[];
    flavors: {
      id: string;
      name: string;
      imageUrl: string | null;
      sku: string | null;
      description: string | null;
      weight: string | null;
      technicalSheetUrl: string | null;
      available: boolean;
      order: number;
      nutrition: Nutrition | null;
    }[];
    nutrition: Nutrition | null;
  }[];
}

async function insertNutrition(
  owner: { productId: string } | { flavorId: string },
  n: Nutrition,
): Promise<void> {
  await prisma.nutritionFacts.create({
    data: {
      id: n.id,
      ...owner,
      servingsPerPackage: n.servingsPerPackage,
      servingAmount: n.servingAmount,
      servingHousehold: n.servingHousehold,
      referenceAmount: n.referenceAmount,
      footnote: n.footnote,
    },
  });
  if (n.rows.length > 0) {
    await prisma.nutritionRow.createMany({
      data: n.rows.map((r) => ({
        id: r.id,
        nutritionFactsId: n.id,
        kind: r.kind as never,
        label: r.label,
        unit: r.unit,
        valuePer100: r.valuePer100,
        valuePerServing: r.valuePerServing,
        dailyValuePercent: r.dailyValuePercent,
        order: r.order,
      })),
    });
  }
}

async function main(): Promise<void> {
  const json = readFileSync(resolve(process.cwd(), "prisma", "preview-seed.json"), "utf8");
  const data = JSON.parse(json) as SeedData;

  console.log("Limpando catálogo local (usuários preservados)...");
  await prisma.nutritionRow.deleteMany();
  await prisma.nutritionFacts.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productFlavor.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();

  console.log("Inserindo settings...");
  await prisma.settings.createMany({ data: data.settings });

  console.log(`Inserindo ${data.categories.length} categorias...`);
  await prisma.category.createMany({
    data: data.categories.map(({ parentId: _p, ...c }) => c),
  });
  for (const c of data.categories) {
    if (c.parentId) {
      await prisma.category.update({ where: { id: c.id }, data: { parentId: c.parentId } });
    }
  }

  console.log(`Inserindo ${data.suppliers.length} fornecedores...`);
  await prisma.supplier.createMany({ data: data.suppliers });

  console.log(`Inserindo ${data.products.length} produtos (+ sabores/imagens/nutrição)...`);
  for (const p of data.products) {
    await prisma.product.create({
      data: {
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
        createdAt: new Date(p.createdAt),
      },
    });

    if (p.flavors.length > 0) {
      await prisma.productFlavor.createMany({
        data: p.flavors.map((f) => ({
          id: f.id,
          productId: p.id,
          name: f.name,
          imageUrl: f.imageUrl,
          sku: f.sku,
          description: f.description,
          weight: f.weight,
          technicalSheetUrl: f.technicalSheetUrl,
          available: f.available,
          order: f.order,
        })),
      });
    }

    if (p.images.length > 0) {
      await prisma.productImage.createMany({
        data: p.images.map((img) => ({
          id: img.id,
          productId: p.id,
          flavorId: img.flavorId,
          url: img.url,
          alt: img.alt,
          order: img.order,
          isPrimary: img.isPrimary,
        })),
      });
    }

    if (p.nutrition) await insertNutrition({ productId: p.id }, p.nutrition);
    for (const f of p.flavors) {
      if (f.nutrition) await insertNutrition({ flavorId: f.id }, f.nutrition);
    }
  }

  console.log("Conectando produtos relacionados...");
  for (const p of data.products) {
    if (p.relatedProductIds.length > 0) {
      await prisma.product.update({
        where: { id: p.id },
        data: { relatedProducts: { connect: p.relatedProductIds.map((id) => ({ id })) } },
      });
    }
  }

  const [prod, cat, sup] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.supplier.count(),
  ]);
  console.log(`Concluído no LOCAL. products=${prod} categories=${cat} suppliers=${sup}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
