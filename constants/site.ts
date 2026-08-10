/**
 * Constantes globais do site.
 * Centralizadas para evitar strings mágicas espalhadas pelo código.
 */

export const SITE_CONFIG = {
  name: "Mira",
  fullName: "Mira",
  description:
    "Soluções completas em insumos para food service, panificação, confeitaria e sorveterias.",
  /** Frase institucional exibida no rodapé, abaixo do logo. */
  footerTagline:
    "Desde 1982 distribuindo qualidade e confiança para panificação, confeitaria, sorveterias e food service.",
  locale: "pt-BR",
  themeColor: "#ffffff",
  /**
   * Textos do hero da página inicial. Ficam no código (não editáveis pelo
   * painel), pois mudam raramente. Ver "Escopo de conteúdo gerenciável".
   */
  hero: {
    title: "Tudo para o seu negócio de food service em um só lugar",
    subtitle:
      "Monte sua cotação em poucos cliques e receba um atendimento rápido da nossa equipe comercial.",
  },
} as const;

export const ROUTES = {
  home: "/",
  products: "/produtos",
  productDetail: (slug: string) => `/produtos/${slug}`,
  categories: "/categorias",
  suppliers: "/fornecedores",
  about: "/sobre",
  units: "/nossas-unidades",
  quote: "/minha-cotacao",
  // Admin
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    products: "/admin/produtos",
    categories: "/admin/categorias",
    suppliers: "/admin/fornecedores",
    quotes: "/admin/cotacoes",
    users: "/admin/usuarios",
    settings: "/admin/configuracoes",
    help: "/admin/ajuda",
    login: "/login",
  },
} as const;
