"use client";

import { useActionState, useEffect, useState } from "react";
import type { QuoteStatus } from "@prisma/client";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/components/ui/native-select";
import { updateQuoteAction } from "@/features/quote/actions/quote-admin-actions";
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_ORDER } from "@/features/quote/constants/quote-status";
import type { ActionResult } from "@/types";

export interface QuoteHandlerOption {
  readonly id: string;
  readonly name: string;
}

interface QuoteDetailManagerProps {
  readonly quoteId: string;
  readonly currentStatus: QuoteStatus;
  readonly currentHandledById: string | null;
  readonly handlerOptions: readonly QuoteHandlerOption[];
}

const selectClass = nativeSelectClass;

/**
 * Atendimento da cotação: muda o status e atribui um responsável. Usa
 * `useActionState` — ao salvar, revalida a página (Server Action) e mostra
 * confirmação inline sem sair da tela.
 */
export function QuoteDetailManager({
  quoteId,
  currentStatus,
  currentHandledById,
  handlerOptions,
}: QuoteDetailManagerProps): React.ReactElement {
  const [state, formAction, isPending] = useActionState<ActionResult<void> | null, FormData>(
    updateQuoteAction.bind(null, quoteId),
    null,
  );

  // Selects controlados, sincronizados com os dados frescos do servidor após
  // salvar (o Server Action revalida a página e reenvia estas props). Assim os
  // campos nunca ficam defasados em relação ao badge de status do cabeçalho.
  const [status, setStatus] = useState<QuoteStatus>(currentStatus);
  const [handledById, setHandledById] = useState<string>(currentHandledById ?? "");

  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);
  useEffect(() => {
    setHandledById(currentHandledById ?? "");
  }, [currentHandledById]);

  const saved = state?.success === true;
  const error = state && !state.success ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          value={status}
          onChange={(event) => setStatus(event.target.value as QuoteStatus)}
          className={selectClass}
        >
          {QUOTE_STATUS_ORDER.map((option) => (
            <option key={option} value={option}>
              {QUOTE_STATUS_LABEL[option]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="handledById">Responsável</Label>
        <select
          id="handledById"
          name="handledById"
          value={handledById}
          onChange={(event) => setHandledById(event.target.value)}
          className={selectClass}
        >
          <option value="">Sem responsável</option>
          {handlerOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-destructive text-sm" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="inline-flex items-center gap-1 text-sm text-green-600" role="status">
          <Check className="size-4" />
          Alterações salvas.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Salvando..." : "Salvar atendimento"}
      </Button>
    </form>
  );
}
