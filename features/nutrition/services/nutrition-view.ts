import type { Prisma } from "@prisma/client";

import {
  DEFAULT_NUTRITION_FOOTNOTE,
  NUTRIENT_DEFINITIONS,
  OTHER_ORDER_OFFSET,
} from "@/features/nutrition/constants/nutrition";

/** `NutritionFacts` com as linhas incluídas (formato retornado pelo catálogo). */
export type NutritionWithRows = Prisma.NutritionFactsGetPayload<{
  include: { rows: true };
}>;

/** Uma linha já pronta para render (rótulo resolvido, valores formatados). */
export interface NutritionRowView {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly indent: boolean;
  readonly per100: string | null;
  readonly perServing: string | null;
  readonly dailyValue: number | null;
}

/** Dados completos da tabela nutricional prontos para o componente. */
export interface NutritionView {
  readonly servingsPerPackage: string | null;
  readonly servingAmount: string;
  readonly servingHousehold: string | null;
  readonly referenceAmount: string;
  readonly footnote: string;
  readonly rows: readonly NutritionRowView[];
}

/** Formata um Decimal para exibição em pt-BR (vírgula, sem zeros supérfluos). */
function formatValue(value: Prisma.Decimal | null): string | null {
  if (value === null) return null;
  return Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}

/**
 * Converte o registro do banco no modelo de exibição: resolve rótulo/unidade
 * (obrigatórios vêm do constants; OTHER usa os campos próprios), ordena
 * (obrigatórios na ordem oficial, extras depois) e formata os valores.
 */
export function buildNutritionView(nutrition: NutritionWithRows): NutritionView {
  const rows: NutritionRowView[] = nutrition.rows
    .map((row) => {
      const definition = row.kind === "OTHER" ? null : NUTRIENT_DEFINITIONS[row.kind];
      // Rótulo/unidade editados no painel têm prioridade; caem no canônico
      // (obrigatórios) quando não foram personalizados.
      return {
        id: row.id,
        label: row.label ?? definition?.label ?? "",
        unit: row.unit ?? definition?.unit ?? "",
        indent: definition?.indent ?? false,
        per100: formatValue(row.valuePer100),
        perServing: formatValue(row.valuePerServing),
        dailyValue: row.dailyValuePercent,
        sortKey: definition?.order ?? OTHER_ORDER_OFFSET + row.order,
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sortKey, ...row }) => row);

  return {
    servingsPerPackage: nutrition.servingsPerPackage,
    servingAmount: nutrition.servingAmount,
    servingHousehold: nutrition.servingHousehold,
    referenceAmount: nutrition.referenceAmount,
    footnote: nutrition.footnote ?? DEFAULT_NUTRITION_FOOTNOTE,
    rows,
  };
}
