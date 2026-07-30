import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

interface QuoteSuccessProps {
  readonly protocol: string;
}

/**
 * Confirmação de envio: mostra o protocolo e um caminho de volta ao catálogo.
 * O carrinho já foi limpo pela `QuoteCartView` ao chegar aqui.
 */
export function QuoteSuccess({ protocol }: QuoteSuccessProps): React.ReactElement {
  return (
    <div className="mx-auto max-w-xl py-8 text-center">
      <CheckCircle2 className="mx-auto size-14 text-green-600" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">Cotação enviada!</h1>
      <p className="text-muted-foreground mt-2">
        Recebemos sua solicitação. Nossa equipe comercial entrará em contato em breve.
      </p>
      <div className="border-border bg-muted/40 mx-auto mt-6 inline-flex flex-col items-center rounded-lg border px-6 py-4">
        <span className="text-muted-foreground text-xs tracking-wide uppercase">Protocolo</span>
        <span className="text-xl font-semibold">{protocol}</span>
      </div>
      <div className="mt-8">
        <Button asChild size="lg">
          <Link href={ROUTES.products}>Voltar aos produtos</Link>
        </Button>
      </div>
    </div>
  );
}
