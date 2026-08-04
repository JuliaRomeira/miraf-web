import { ROUTES } from "@/constants";

/**
 * Dados do Hero da página inicial — a única fonte a editar.
 *
 * Cada slide conta uma pequena história sobre a Mira. Para trocar um banner,
 * basta editar `eyebrow` / `title` / `description` e apontar `image` para a
 * foto definitiva (ver abaixo). Os CTAs têm um padrão compartilhado
 * (`DEFAULT_HERO_CTAS`) e podem ser sobrescritos por slide.
 *
 * IMAGENS:
 *   Cada slide tem foto em `public/images/hero/<arquivo>.png` (2400×1400,
 *   foco à direita e área escura à esquerda para o texto). Para trocar, basta
 *   substituir o arquivo ou apontar `image` para outro caminho. Se `image` ficar
 *   ausente, o slide cai no degradê institucional da marca — nada quebra. O
 *   overlay azul/vermelho é aplicado por cima da foto (ou do degradê), mantendo
 *   a leitura do texto.
 */

export interface HeroCta {
  readonly label: string;
  readonly href: string;
}

export interface HeroSlide {
  readonly id: string;
  /** Rótulo curto acima do título (ex.: "Panificação"). */
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  /**
   * Caminho da foto de fundo em alta resolução. Ausente = usa o degradê
   * `gradient` da marca como fundo. Ex.: "/images/hero/panificacao.jpg".
   */
  readonly image?: string;
  /** Texto alternativo da foto (acessibilidade). */
  readonly imageAlt?: string;
  /**
   * Degradê institucional de fundo, usado enquanto a foto não existe (e como
   * base sob a foto). Opcional — se ausente, usa `BRAND_HERO_GRADIENT` (padrão
   * da marca). Só sobrescreva com tons de `#17479e` para manter a identidade.
   */
  readonly gradient?: string;
  /** CTAs do slide. Padrão: `DEFAULT_HERO_CTAS`. */
  readonly primaryCta?: HeroCta;
  readonly secondaryCta?: HeroCta;
}

/**
 * Degradê de fundo padrão do hero — exclusivamente tons do azul da marca
 * (`#17479e`): escuro → base → um pouco mais claro. Único para todos os slides,
 * garantindo consistência visual até as fotos definitivas entrarem.
 */
export const BRAND_HERO_GRADIENT = "linear-gradient(135deg, #0e2c62 0%, #17479e 58%, #2159bd 100%)";

/** CTAs padrão — vermelho institucional (primário) e contorno (secundário). */
export const DEFAULT_HERO_CTAS = {
  primary: { label: "Ver catálogo", href: ROUTES.products },
  secondary: { label: "Solicitar cotação", href: ROUTES.quote },
} as const;

/**
 * Indicadores de confiança exibidos abaixo dos botões (fixos, valem para todos
 * os slides). Ícone escolhido em `home-hero.tsx` pelo `icon`.
 */
export const HERO_TRUST_BADGES = [
  { icon: "history", label: "Mais de 40 anos de mercado" },
  { icon: "package", label: "Mais de 2.500 produtos" },
  { icon: "headset", label: "Atendimento especializado" },
  { icon: "truck", label: "Distribuição para toda a região" },
] as const;

export type HeroTrustIcon = (typeof HERO_TRUST_BADGES)[number]["icon"];

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: "panificacao",
    eyebrow: "Panificação",
    title: "Farinhas, fermentos e insumos que fazem a diferença na sua produção.",
    description:
      "Há mais de 40 anos levando marcas de confiança, variedade e atendimento especializado para padarias de toda a região.",
    image: "/images/hero/panificacao.png",
    imageAlt: "Variedade de pães artesanais frescos com trigo e farinha",
  },
  {
    id: "confeitaria",
    eyebrow: "Confeitaria",
    title: "Os melhores ingredientes para a confeitaria profissional.",
    description:
      "Trabalhamos com as principais marcas do mercado, oferecendo qualidade, desempenho e consistência para quem faz da confeitaria um negócio.",
    image: "/images/hero/confeitaria.png",
    imageAlt:
      "Chocolate derretido, cacau em pó, farinha e utensílios de confeitaria sobre fundo azul",
  },
  {
    id: "atendimento",
    eyebrow: "Atendimento",
    title: "Atendimento especializado para quem produz todos os dias.",
    description:
      "Mais do que vender produtos, oferecemos suporte, agilidade e as melhores soluções para o abastecimento do seu negócio.",
    image: "/images/hero/equipe-comercial.png",
    imageAlt:
      "Equipe comercial da Mira atendendo com tablet, cercada de insumos de panificação e confeitaria",
  },
  {
    id: "food-service",
    eyebrow: "Distribuidora Mira",
    title: "Tudo para o seu negócio de food service em um só lugar",
    description:
      "Há mais de 40 anos abastecendo cozinhas profissionais com agilidade, variedade e um atendimento que entende do seu dia a dia.",
    image: "/images/hero/food-service.png",
    imageAlt:
      "Confeiteira decorando um bolo de chocolate em uma cozinha profissional cercada de pães e doces",
  },
  {
    id: "sorveterias",
    eyebrow: "Sorveterias",
    title: "Bases, coberturas e insumos para o sorvete perfeito",
    description:
      "Tudo o que a sua sorveteria precisa para manter cremosidade, sabor e consistência do início ao fim da produção.",
    image: "/images/hero/sorveterias.png",
    imageAlt: "Baldes de sorvete de chocolate e creme com coberturas, granulado e casquinhas",
  },
  {
    id: "centro-distribuicao",
    eyebrow: "Estrutura",
    title: "Um centro de distribuição pronto para atender sua demanda",
    description:
      "Logística própria e três unidades no interior de São Paulo garantem entregas rápidas e no prazo para toda a região.",
    image: "/images/hero/centro-distribuicao.png",
    imageAlt: "Centro de distribuição com paletes, empilhadeira e caminhão sendo carregado",
  },
];
