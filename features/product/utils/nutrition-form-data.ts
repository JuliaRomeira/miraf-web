import type { NutrientKind, Prisma } from "@prisma/client";

import type { NutritionData } from "@/features/product/components/nutrition-fields";

/** Formato cru vindo do banco (NutritionFacts + rows) que sabemos mapear. */
interface RawNutritionRow {
  readonly kind: NutrientKind;
  readonly label: string | null;
  readonly unit: string | null;
  readonly valuePer100: Prisma.Decimal | null;
  readonly valuePerServing: Prisma.Decimal | null;
  readonly dailyValuePercent: number | null;
}

interface RawNutrition {
  readonly servingsPerPackage: string | null;
  readonly servingAmount: string;
  readonly servingHousehold: string | null;
  readonly referenceAmount: string;
  readonly rows: readonly RawNutritionRow[];
}

/**
 * Converte a tabela nutricional salva (Prisma) para os valores do formulário
 * (`NutritionData`, tudo string). Usado para pré-carregar o cadastro na edição,
 * tanto da tabela do produto quanto da de cada sabor. `null` = sem tabela.
 */
export function toNutritionFormData(nutrition: RawNutrition | null): NutritionData | null {
  if (!nutrition) {
    return null;
  }
  return {
    servingsPerPackage: nutrition.servingsPerPackage ?? "",
    servingAmount: nutrition.servingAmount,
    servingHousehold: nutrition.servingHousehold ?? "",
    referenceAmount: nutrition.referenceAmount,
    rows: nutrition.rows.map((row) => ({
      kind: row.kind,
      label: row.label ?? "",
      unit: row.unit ?? "",
      per100: row.valuePer100 !== null ? String(Number(row.valuePer100)) : "",
      perServing: row.valuePerServing !== null ? String(Number(row.valuePerServing)) : "",
      vd: row.dailyValuePercent !== null ? String(row.dailyValuePercent) : "",
    })),
  };
}
