"use client";

import { useMemo, useState } from "react";

import {
  NutritionFields,
  emptyNutritionData,
  serializeNutritionData,
  type NutritionData,
} from "@/features/product/components/nutrition-fields";

/** Valor inicial do nível do produto: os dados da tabela + se está ligada. */
export interface NutritionFormValue extends NutritionData {
  readonly enabled: boolean;
}

interface NutritionFormSectionProps {
  readonly name: string;
  readonly initial?: NutritionFormValue | null;
  /** O produto tem sabores? Muda o rótulo para "tabela geral" (fallback). */
  readonly hasFlavors?: boolean;
}

/**
 * Seção "Informação nutricional" do produto. Sem sabores, é a tabela do
 * produto. Com sabores, é a tabela GERAL — exibida quando o sabor selecionado
 * não tem a sua própria (cada sabor pode ter uma na seção "Sabores"). Toggle +
 * editor compartilhado, serializado num hidden input em JSON. Sem toggle =
 * `null` = sem tabela.
 */
export function NutritionFormSection({
  name,
  initial,
  hasFlavors = false,
}: NutritionFormSectionProps): React.ReactElement {
  const [enabled, setEnabled] = useState(initial?.enabled ?? false);
  const [data, setData] = useState<NutritionData>(() => initial ?? emptyNutritionData());

  const serialized = useMemo(
    () => (enabled ? JSON.stringify(serializeNutritionData(data)) : "null"),
    [enabled, data],
  );

  return (
    <section className="space-y-5">
      <input type="hidden" name={name} value={serialized} />

      <div className="flex items-center justify-between gap-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">
          {hasFlavors ? "Informação nutricional geral" : "Informação nutricional"}
        </h2>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
          {hasFlavors ? "Este produto tem tabela geral" : "Este produto tem tabela nutricional"}
        </label>
      </div>

      {hasFlavors && (
        <p className="text-muted-foreground text-sm">
          Tabela padrão do produto, usada quando um sabor não tem a sua própria. Para valores que
          mudam por sabor, preencha a tabela dentro de cada sabor na seção “Sabores”.
        </p>
      )}

      {enabled && <NutritionFields value={data} onChange={setData} idPrefix="nutrition" />}
    </section>
  );
}
