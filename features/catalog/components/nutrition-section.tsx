"use client";

import { CollapsibleMedia } from "@/components/shared/collapsible-media";
import { NutritionTable } from "@/features/nutrition/components/nutrition-table";
import type { NutritionView } from "@/features/nutrition/services/nutrition-view";

interface NutritionSectionProps {
  readonly data: NutritionView;
  /** Sufixo do título (ex.: nome da variação selecionada). */
  readonly variationName?: string | null;
}

/**
 * Seção "Tabela nutricional" da página de produto. Usa `CollapsibleMedia`: se a
 * tabela for grande, mostra uma prévia (altura máxima) com botão "Ver completa"
 * que abre em modal. Tabelas pequenas aparecem inteiras.
 */
export function NutritionSection({
  data,
  variationName,
}: NutritionSectionProps): React.ReactElement {
  return (
    <section>
      <h2 className="font-display mb-4 flex items-center gap-2.5 text-xl font-bold tracking-tight">
        <span aria-hidden className="bg-primary h-5 w-1 shrink-0 rounded-full" />
        Tabela nutricional
        {variationName ? <span className="text-muted-foreground"> · {variationName}</span> : null}
      </h2>
      <CollapsibleMedia
        modalTitle={`Tabela nutricional${variationName ? ` — ${variationName}` : ""}`}
        buttonLabel="Ver tabela completa"
      >
        <NutritionTable data={data} />
      </CollapsibleMedia>
    </section>
  );
}
