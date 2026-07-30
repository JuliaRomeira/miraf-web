import Link from "next/link";
import type { QuoteStatus } from "@prisma/client";
import { Eye, Inbox } from "lucide-react";

import { AdminPagination } from "@/components/shared/admin-pagination";
import { DeleteButton } from "@/components/shared/delete-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuoteStatusBadge } from "@/features/quote/components/quote-status-badge";
import { QUOTE_STATUS_LABEL, QUOTE_STATUS_ORDER } from "@/features/quote/constants/quote-status";
import { deleteQuoteAction } from "@/features/quote/actions/quote-admin-actions";
import { listQuotes } from "@/features/quote/services/quote-admin-service";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Cotações",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

interface QuotesPageProps {
  readonly searchParams: Promise<{ status?: string; page?: string }>;
}

function parseStatus(value: string | undefined): QuoteStatus | undefined {
  return QUOTE_STATUS_ORDER.find((status) => status === value);
}

export default async function QuotesPage({
  searchParams,
}: QuotesPageProps): Promise<React.ReactElement> {
  const { status, page: pageRaw } = await searchParams;
  const activeStatus = parseStatus(status);
  const page = Number(pageRaw) || 1;
  const result = await listQuotes({ status: activeStatus, page });
  const quotes = result.items;

  const makeHref = (targetPage: number): string => {
    const sp = new URLSearchParams();
    if (activeStatus) sp.set("status", activeStatus);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${ROUTES.admin.quotes}?${qs}` : ROUTES.admin.quotes;
  };

  const filters: Array<{ label: string; href: string; active: boolean }> = [
    { label: "Todas", href: ROUTES.admin.quotes, active: !activeStatus },
    ...QUOTE_STATUS_ORDER.map((s) => ({
      label: QUOTE_STATUS_LABEL[s],
      href: `${ROUTES.admin.quotes}?status=${s}`,
      active: activeStatus === s,
    })),
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Cotações</h1>
        <p className="text-muted-foreground text-sm">
          Solicitações de orçamento recebidas pelo site.
        </p>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por status">
        {filters.map((filter) => (
          <Link
            key={filter.href}
            href={filter.href}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition-colors",
              filter.active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-accent",
            )}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {quotes.length === 0 ? (
        <div className="border-border text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm">
          <Inbox className="size-8 opacity-40" aria-hidden />
          {activeStatus ? "Nenhuma cotação com este status." : "Nenhuma cotação recebida ainda."}
        </div>
      ) : (
        <div className="border-border rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Protocolo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Itens</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recebida</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.protocol}</TableCell>
                  <TableCell>
                    {quote.company ?? quote.name}
                    {quote.company && (
                      <span className="text-muted-foreground block text-xs">{quote.name}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{quote.itemCount}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {quote.handledByName ?? "—"}
                  </TableCell>
                  <TableCell>
                    <QuoteStatusBadge status={quote.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {dateFormatter.format(quote.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="Ver cotação">
                        <Link href={`${ROUTES.admin.quotes}/${quote.id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        action={deleteQuoteAction.bind(null, quote.id)}
                        itemLabel={`a cotação "${quote.protocol}"`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {result.totalPages > 1 && (
        <AdminPagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
      )}
    </div>
  );
}
