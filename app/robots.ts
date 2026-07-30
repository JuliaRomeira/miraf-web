import type { MetadataRoute } from "next";

/**
 * Robots.txt gerado pelo Next.js.
 *
 * Bloqueia crawlers em rotas administrativas e da API. As URLs públicas
 * (home, catálogo, receitas) são liberadas por padrão.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
