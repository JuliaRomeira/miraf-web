import { z } from "zod";

/** Uma imagem do produto (URL já gerada pelo upload + flag de capa). */
const productImageSchema = z.object({
  url: z
    .string()
    .refine(
      (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
      "URL de imagem inválida.",
    ),
  isPrimary: z.boolean(),
});

/** Nutrientes válidos (espelha o enum `NutrientKind` do Prisma). */
const NUTRIENT_KINDS = [
  "ENERGY",
  "CARBOHYDRATES",
  "SUGARS_TOTAL",
  "SUGARS_ADDED",
  "PROTEIN",
  "FATS_TOTAL",
  "FATS_SATURATED",
  "FATS_TRANS",
  "FIBER",
  "SODIUM",
  "OTHER",
] as const;

/** Uma linha de nutriente. Valores nulos = célula em branco (normal no padrão). */
const nutritionRowSchema = z.object({
  kind: z.enum(NUTRIENT_KINDS),
  label: z.string().trim().max(80).optional(),
  unit: z.string().trim().max(16).optional(),
  valuePer100: z.number().nonnegative("Valor inválido.").nullable(),
  valuePerServing: z.number().nonnegative("Valor inválido.").nullable(),
  dailyValuePercent: z.number().int().min(0).max(1000).nullable(),
});

/** Tabela nutricional (cabeçalho + linhas). `null` = sem tabela. */
const nutritionSchema = z.object({
  servingsPerPackage: z.string().trim().max(60).optional(),
  servingAmount: z.string().trim().max(60).default(""),
  servingHousehold: z.string().trim().max(80).optional(),
  referenceAmount: z.string().trim().min(1).max(20).default("100 g"),
  rows: z.array(nutritionRowSchema).default([]),
});

/** Caminho de arquivo (upload local `/...`) ou URL http(s); vazio = undefined. */
const uploadPathSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined))
  .refine(
    (value) => value === undefined || /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Caminho de arquivo inválido.",
  );

/**
 * Uma variação (sabor) do produto — cadastro completo. Nome obrigatório; foto,
 * SKU, peso, descrição própria (HTML), ficha técnica (PDF/imagem) e tabela
 * nutricional são opcionais. `available` controla a disponibilidade na cotação.
 * A descrição/ficha/tabela da variação sobrepõem as do produto quando presentes.
 */
const productFlavorSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da variação.").max(80, "Máximo de 80 caracteres."),
  /** Galeria própria da variação (frente, verso, embalagem…). */
  images: z.array(productImageSchema).default([]),
  sku: z.string().trim().max(60, "Máximo de 60 caracteres.").optional(),
  weight: z.string().trim().max(40, "Máximo de 40 caracteres.").optional(),
  description: z.string().trim().max(20000, "Descrição muito longa.").optional(),
  technicalSheetUrl: uploadPathSchema,
  available: z.boolean().default(true),
  nutrition: nutritionSchema.nullable().default(null),
});

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres.")
    .max(150, "Máximo de 150 caracteres."),
  // Guarda HTML do editor rico; o limite é maior que o de texto puro por causa
  // das tags. Editor vazio chega como "" (o cliente zera) e cai no min(1).
  description: z
    .string()
    .trim()
    .min(1, "A descrição é obrigatória.")
    .max(20000, "Descrição muito longa."),
  /** Descrição resumida (texto curto exibido no topo do detalhe). */
  shortDescription: z.string().trim().max(300, "Máximo de 300 caracteres.").optional(),
  /** Composição/ingredientes (HTML do editor rico) — opcional. */
  composition: z.string().trim().max(20000, "Texto muito longo.").optional(),
  /** Modo de aplicação/uso (HTML do editor rico) — opcional. */
  application: z.string().trim().max(20000, "Texto muito longo.").optional(),
  /** Conservação/armazenamento (HTML do editor rico) — opcional. */
  conservation: z.string().trim().max(20000, "Texto muito longo.").optional(),
  /** Modo de preparo (HTML do editor rico) — opcional. */
  preparation: z.string().trim().max(20000, "Texto muito longo.").optional(),
  /** Ficha técnica (PDF ou imagem) — caminho do upload; opcional. */
  technicalSheetUrl: uploadPathSchema,
  /** Destaques/benefícios (bullets curtos). Vazios são descartados no service. */
  highlights: z.array(z.string().trim().max(120, "Máximo de 120 caracteres.")).default([]),
  /** Peso/medida líquida (texto livre, ex.: "5 kg"). */
  weight: z.string().trim().max(40, "Máximo de 40 caracteres.").optional(),
  /** IDs de produtos relacionados (auto-relação N:N). */
  relatedProductIds: z.array(z.string().trim().min(1)).default([]),
  sku: z.string().trim().max(60, "Máximo de 60 caracteres.").optional(),
  packaging: z.string().trim().max(120, "Máximo de 120 caracteres.").optional(),
  saleUnit: z
    .string()
    .trim()
    .min(1, "Informe a unidade de venda.")
    .max(40, "Máximo de 40 caracteres.")
    .default("unidade"),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  featured: z.boolean(),
  order: z
    .number()
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem não pode ser negativa."),
  categoryId: z.string().trim().min(1, "Selecione uma categoria."),
  /** Subcategoria opcional; quando informada, deve pertencer à categoria (validado no service). */
  subcategoryId: z.string().trim().min(1).optional(),
  supplierId: z.string().trim().min(1).optional(),
  images: z.array(productImageSchema).default([]),
  flavors: z.array(productFlavorSchema).default([]),
  nutrition: nutritionSchema.nullable().default(null),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductImageInput = z.infer<typeof productImageSchema>;
export type ProductFlavorInput = z.infer<typeof productFlavorSchema>;
export type NutritionInput = z.infer<typeof nutritionSchema>;
