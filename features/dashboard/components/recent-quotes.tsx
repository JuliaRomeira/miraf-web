import { Inbox } from "lucide-react";

import Link from "next/link";

import { QuoteStatusBadge } from "@/features/quote/components/quote-status-badge";
import { ROUTES } from "@/constants";
import type { RecentQuote } from "../services/dashboard-service";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

interface RecentQuotesProps {
  quotes: readonly RecentQuote[];
}

/**
 * Lista as cotações mais recentes. Cada linha linka para o atendimento da
 * cotação na aba Cotações do painel.
 */
export function RecentQuotes({ quotes }: RecentQuotesProps): React.ReactElement {
  return (
    <section className="bg-card text-card-foreground border-border rounded-lg border">
      <header className="border-border border-b px-5 py-4">
        <h2 className="text-base font-semibold">Cotações recentes</h2>
        <p className="text-muted-foreground text-sm">Últimas solicitações recebidas.</p>
      </header>

      {quotes.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center gap-2 px-5 py-12 text-center text-sm">
          <Inbox className="size-8 opacity-40" aria-hidden />
          <p>Nenhuma cotação recebida ainda.</p>
        </div>
      ) : (
        <ul className="divide-border divide-y">
          {quotes.map((quote) => (
            <li key={quote.id}>
              <Link
                href={`${ROUTES.admin.quotes}/${quote.id}`}
                className="hover:bg-accent/40 flex items-center justify-between gap-4 px-5 py-3.5 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {quote.company ?? quote.name}
                    <span className="text-muted-foreground ml-2 font-normal">{quote.protocol}</span>
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {quote.itemCount} {quote.itemCount === 1 ? "item" : "itens"} ·{" "}
                    {dateFormatter.format(quote.createdAt)}
                  </p>
                </div>
                <QuoteStatusBadge status={quote.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
