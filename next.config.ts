import type { NextConfig } from "next";

/**
 * Configuração do Next.js para produção.
 *
 * - `output: "standalone"`: gera um build enxuto para Docker (só o necessário
 *   para rodar, sem `node_modules` completo).
 * - `images.formats`: formatos servidos pelo `next/image` (as imagens ficam no
 *   próprio servidor, em `public/uploads` — não há fontes remotas).
 * - `poweredByHeader: false`: remove o header `X-Powered-By: Next.js` por segurança.
 * - `compress: true`: habilita compressão gzip nativa.
 * - `reactStrictMode: true`: ativa checagens adicionais em desenvolvimento.
 */
const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Oculta o indicador de desenvolvimento do Next.js (o círculo com o "N" no
  // canto). É exibido apenas em `next dev` e nunca em produção — desativado
  // para não poluir a visualização.
  devIndicators: false,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    // Níveis de qualidade permitidos ao `next/image`. 90 é usado nos banners do
    // hero (fotos grandes exigem mais nitidez); 75 segue como padrão do restante.
    qualities: [75, 90],
  },
  experimental: {
    // Otimiza importações de bibliotecas com muitos exports (tree-shaking mais agressivo)
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
