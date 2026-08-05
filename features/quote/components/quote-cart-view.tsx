"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useQuoteCart } from "@/features/quote/store/quote-cart-context";
import { QuoteItemList } from "@/features/quote/components/quote-item-list";
import { QuoteForm } from "@/features/quote/components/quote-form";
import { QuoteSuccess } from "@/features/quote/components/quote-success";
import {
  createQuoteAction,
  type QuoteSuccess as QuoteSuccessData,
} from "@/features/quote/actions/create-quote";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

const initialState: ActionResult<QuoteSuccessData> = {
  success: true,
  data: { protocol: "" },
};

/**
 * Orquestra a página "Minha cotação": estado do carrinho + envio (useActionState).
 * Ao enviar com sucesso, limpa o carrinho e mostra a tela de protocolo.
 */
export function QuoteCartView(): React.ReactElement {
  const { items, lineCount, hydrated, clear } = useQuoteCart();
  const [state, formAction, isPending] = useActionState(createQuoteAction, initialState);
  const [confirmedProtocol, setConfirmedProtocol] = useState<string | null>(null);
  const clearedRef = useRef(false);

  // Sucesso com protocolo real (o estado inicial tem protocol vazio): fixa o
  // protocolo, limpa o carrinho uma única vez e passa a mostrar a confirmação.
  const succeeded = state.success && state.data.protocol !== "";
  useEffect(() => {
    if (succeeded && !clearedRef.current) {
      clearedRef.current = true;
      setConfirmedProtocol(state.success ? state.data.protocol : null);
      clear();
    }
  }, [succeeded, state, clear]);

  if (confirmedProtocol) {
    return <QuoteSuccess protocol={confirmedProtocol} />;
  }

  // Evita piscar o empty state antes de hidratar o localStorage.
  if (!hydrated) {
    return <div className="text-muted-foreground py-12 text-center text-sm">Carregando…</div>;
  }

  if (lineCount === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <ClipboardList className="text-muted-foreground mx-auto size-12" aria-hidden="true" />
        <h1 className="font-display mt-4 text-xl font-semibold">Sua cotação está vazia</h1>
        <p className="text-muted-foreground mt-2">
          Adicione produtos do catálogo para solicitar um orçamento à nossa equipe.
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href={ROUTES.products}>Ver produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fieldErrors = !state.success ? state.fieldErrors : undefined;
  const formError = !state.success && !fieldErrors ? state.error : undefined;
  const itemsJson = JSON.stringify(
    items.map((item) => ({
      productId: item.productId,
      flavorId: item.flavorId,
      quantity: item.quantity,
    })),
  );

  return (
    <div>
      <h1 className="font-display mb-2 text-3xl font-semibold tracking-tight">Minha cotação</h1>
      <p className="text-muted-foreground mb-8">
        Revise os produtos e informe seus dados para solicitar um orçamento sem compromisso.
      </p>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]">
        <div className="min-w-0">
          <QuoteItemList />
        </div>
        <div className="border-border bg-card h-fit min-w-0 rounded-2xl border p-6">
          <h2 className="font-display mb-4 text-lg font-semibold">Seus dados</h2>
          <QuoteForm
            formAction={formAction}
            isPending={isPending}
            itemsJson={itemsJson}
            fieldErrors={fieldErrors}
            formError={formError}
          />
        </div>
      </div>
    </div>
  );
}
