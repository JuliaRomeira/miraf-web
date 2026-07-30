"use client";

import { useEffect, useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface FormTab {
  readonly id: string;
  readonly label: string;
  /** Marca a aba com um ponto de alerta (ex.: contém campo com erro). */
  readonly hasError?: boolean;
  readonly content: React.ReactNode;
}

interface FormTabsProps {
  readonly tabs: readonly FormTab[];
}

/**
 * Abas para formulários longos: divide o conteúdo em seções navegáveis sem
 * amontoar campos numa só tela. Todos os painéis ficam MONTADOS (só escondidos
 * via `hidden`) para que os inputs continuem no DOM e sejam enviados pelo
 * FormData. Quando uma aba passa a ter erro (após submit), a navegação salta
 * para a primeira aba com erro. Estilo alinhado ao Design System (aba ativa em
 * azul da marca, sublinhado).
 */
export function FormTabs({ tabs }: FormTabsProps): React.ReactElement {
  const baseId = useId();
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  // Assinatura das abas com erro — quando muda (novo submit inválido), pula
  // para a primeira aba com erro para o usuário ver a mensagem.
  const errorSignature = tabs
    .filter((tab) => tab.hasError)
    .map((tab) => tab.id)
    .join(",");

  useEffect(() => {
    if (!errorSignature) return;
    const first = errorSignature.split(",")[0];
    if (first) setActive(first);
  }, [errorSignature]);

  return (
    <div className="space-y-6">
      <div
        role="tablist"
        aria-label="Seções do formulário"
        className="border-border flex flex-wrap gap-x-1 gap-y-1 border-b"
      >
        {tabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.id}`}
              onClick={() => setActive(tab.id)}
              className={cn(
                "focus-visible:ring-ring relative -mb-px inline-flex items-center gap-1.5 rounded-t-md border-b-2 px-4 py-2.5 text-sm font-medium transition focus-visible:ring-2 focus-visible:outline-none",
                selected
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent",
              )}
            >
              {tab.label}
              {tab.hasError && (
                <span className="bg-destructive size-1.5 rounded-full" aria-label="Contém erros" />
              )}
            </button>
          );
        })}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${baseId}-panel-${tab.id}`}
          aria-labelledby={`${baseId}-tab-${tab.id}`}
          hidden={tab.id !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
