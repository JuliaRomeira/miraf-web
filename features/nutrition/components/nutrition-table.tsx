import type { NutritionView } from "@/features/nutrition/services/nutrition-view";

import { cn } from "@/lib/utils";

interface NutritionTableProps {
  readonly data: NutritionView;
}

/** Célula de valor: mostra o número ou fica vazia (branco é normal no padrão). */
function ValueCell({
  children,
  emphasis,
}: {
  children: React.ReactNode;
  emphasis?: boolean;
}): React.ReactElement {
  return (
    <td
      className={cn(
        "text-foreground px-2 py-3 text-center whitespace-nowrap tabular-nums",
        emphasis && "font-semibold",
      )}
    >
      {children}
    </td>
  );
}

/**
 * Nutrientes-chave que recebem leve destaque de leitura (valor energético e
 * proteínas). Casado por substring do rótulo (em minúsculas) — "energ" e "prote"
 * aparecem nos rótulos canônicos independentemente de acento. Se a cliente usar
 * um rótulo totalmente diferente, apenas não destaca (nunca altera o dado).
 */
function isKeyNutrient(label: string): boolean {
  const normalized = label.toLowerCase();
  return normalized.includes("energ") || normalized.includes("prote");
}

/**
 * Tabela de Informação Nutricional no padrão brasileiro (ANVISA RDC 429/2020):
 * colunas por 100 g/ml, por porção e %VD. Construída em HTML semântico (não é
 * imagem), com a identidade visual do site — faixa de título na cor da marca e
 * zebra sutil. Rótulos alinhados à esquerda e as três colunas de valor com
 * largura fixa e igual, para uma leitura uniforme. Nutrientes-chave (valor
 * energético e proteínas) recebem leve realce. Responsiva: rola na horizontal em
 * telas muito estreitas sem quebrar a leitura.
 */
export function NutritionTable({ data }: NutritionTableProps): React.ReactElement {
  const servingLine = data.servingHousehold
    ? `${data.servingAmount} (${data.servingHousehold})`
    : data.servingAmount;

  return (
    <section
      aria-label="Informação Nutricional"
      className="border-border/70 bg-card shadow-soft overflow-hidden rounded-2xl border"
    >
      <div className="bg-primary text-primary-foreground px-5 py-4 text-center">
        <p className="text-lg font-semibold tracking-wide uppercase">Informação Nutricional</p>
      </div>

      <div className="bg-muted/40 text-muted-foreground border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b px-5 py-3.5 text-base">
        <p>Porção: {servingLine}</p>
        {data.servingsPerPackage && <p>Porções por embalagem: {data.servingsPerPackage}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[20rem] table-fixed border-collapse text-sm sm:text-base">
          <caption className="sr-only">
            Tabela de informação nutricional por {data.referenceAmount} e por porção de{" "}
            {data.servingAmount}.
          </caption>
          <colgroup>
            <col />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
            <col className="w-[17%]" />
          </colgroup>
          <thead>
            <tr className="text-muted-foreground border-border border-b text-sm">
              <th scope="col" className="px-3 py-3 text-left font-medium sm:px-5" />
              <th scope="col" className="px-2 py-3 text-center font-medium">
                {data.referenceAmount}
              </th>
              <th scope="col" className="px-2 py-3 text-center font-medium">
                {data.servingAmount}
              </th>
              <th scope="col" className="px-2 py-3 text-center font-medium">
                %VD<sup>(*)</sup>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => {
              const key = isKeyNutrient(row.label);
              return (
                <tr
                  key={row.id}
                  className={cn(
                    "border-border/60 border-b last:border-0",
                    key ? "bg-accent/50" : "even:bg-muted/30",
                  )}
                >
                  <th
                    scope="row"
                    className={cn(
                      "text-foreground px-3 py-3 text-left font-normal sm:px-5",
                      key && "text-primary font-semibold",
                    )}
                  >
                    {row.label}
                    {row.unit && (
                      <span className={cn("text-muted-foreground", key && "text-primary/70")}>
                        {" "}
                        ({row.unit})
                      </span>
                    )}
                  </th>
                  <ValueCell emphasis={key}>{row.per100}</ValueCell>
                  <ValueCell emphasis={key}>{row.perServing}</ValueCell>
                  <ValueCell emphasis={key}>{row.dailyValue}</ValueCell>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground px-5 py-3.5 text-sm">{data.footnote}</p>
    </section>
  );
}
