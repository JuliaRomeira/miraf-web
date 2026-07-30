import type { MetadataRoute } from "next";

import { ROUTES } from "@/constants";
import { prisma } from "@/lib/prisma";

/**
 * Sitemap gerado pelo Next.js: rotas estáticas reais do site + URLs dinâmicas
 * dos produtos ativos (lidas do banco). Só inclui páginas que existem — nada de
 * URLs que retornariam 404.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}${ROUTES.home}`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${baseUrl}${ROUTES.products}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${ROUTES.categories}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}${ROUTES.about}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}${ROUTES.units}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // URLs dinâmicas dos produtos ativos. Em caso de falha de banco, o sitemap
  // ainda entrega as rotas estáticas (não quebra o build/SSR).
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: { slug: true, updatedAt: true },
    });
    productRoutes = products.map((product) => ({
      url: `${baseUrl}${ROUTES.productDetail(product.slug)}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
