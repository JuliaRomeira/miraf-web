import type { NutrientKind } from "@prisma/client";

/**
 * Definições canônicas dos nutrientes obrigatórios (padrão ANVISA RDC 429/2020).
 * Fonte única de rótulo, unidade, ordem e indentação — assim os rótulos nunca
 * divergem por digitação e a ordem da tabela é sempre a oficial. `OTHER` (não
 * listado aqui) carrega rótulo/unidade próprios no banco.
 */
export interface NutrientDefinition {
  readonly label: string;
  readonly unit: string;
  readonly order: number;
  /** Sub-item exibido indentado sob o nutriente principal. */
  readonly indent?: boolean;
}

export const NUTRIENT_DEFINITIONS: Record<Exclude<NutrientKind, "OTHER">, NutrientDefinition> = {
  ENERGY: { label: "Valor energético", unit: "kcal", order: 10 },
  CARBOHYDRATES: { label: "Carboidratos", unit: "g", order: 20 },
  SUGARS_TOTAL: { label: "Açúcares totais", unit: "g", order: 30, indent: true },
  SUGARS_ADDED: { label: "Açúcares adicionados", unit: "g", order: 40, indent: true },
  PROTEIN: { label: "Proteínas", unit: "g", order: 50 },
  FATS_TOTAL: { label: "Gorduras totais", unit: "g", order: 60 },
  FATS_SATURATED: { label: "Gorduras saturadas", unit: "g", order: 70, indent: true },
  FATS_TRANS: { label: "Gorduras trans", unit: "g", order: 80, indent: true },
  FIBER: { label: "Fibras alimentares", unit: "g", order: 90 },
  SODIUM: { label: "Sódio", unit: "mg", order: 100 },
};

/** Ordem-base aplicada às linhas OTHER (depois dos obrigatórios). */
export const OTHER_ORDER_OFFSET = 1000;

export const DEFAULT_NUTRITION_FOOTNOTE = "* Percentual de valores diários fornecidos pela porção.";
