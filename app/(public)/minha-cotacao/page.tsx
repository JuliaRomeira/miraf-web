import type { Metadata } from "next";

import { QuoteCartView } from "@/features/quote/components/quote-cart-view";

export const metadata: Metadata = {
  title: "Minha cotação",
  description: "Revise os produtos selecionados e envie sua solicitação de orçamento.",
  robots: { index: false, follow: true },
};

/**
 * Página "Minha cotação" — lista os itens selecionados e o formulário de envio.
 * O conteúdo é client-side (lê o carrinho do localStorage); esta página só
 * fornece o enquadramento e o título.
 */
export default function QuotePage(): React.ReactElement {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <QuoteCartView />
    </section>
  );
}
