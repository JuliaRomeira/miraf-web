import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { QuoteStatusBadge } from "@/features/quote/components/quote-status-badge";
import { QuoteDetailManager } from "@/features/quote/components/quote-detail-manager";
import { getQuoteById } from "@/features/quote/services/quote-admin-service";
import { listUsers } from "@/features/user/services/user-service";
import { formatCpfCnpj, formatPhone } from "@/utils/format";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Atendimento de cotação",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

interface QuoteDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

function InfoRow({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="text-muted-foreground w-32 shrink-0 text-sm">{label}</dt>
      <dd className="text-sm font-medium break-words">{value}</dd>
    </div>
  );
}

export default async function QuoteDetailPage({
  params,
}: QuoteDetailPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const [quote, users] = await Promise.all([getQuoteById(id), listUsers()]);

  if (!quote) {
    notFound();
  }

  const handlerOptions = users
    .filter((user) => user.active)
    .map((user) => ({ id: user.id, name: user.name }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.quotes}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para cotações
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Cotação {quote.protocol}</h1>
          <QuoteStatusBadge status={quote.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          Recebida em {dateFormatter.format(quote.createdAt)}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Dados do cliente</h2>
            <dl className="space-y-3">
              <InfoRow label="Nome" value={quote.name} />
              <InfoRow label={quote.documentType} value={formatCpfCnpj(quote.document)} />
              <InfoRow label="E-mail" value={quote.email} />
              <InfoRow label="Telefone" value={formatPhone(quote.phone)} />
              {quote.company && <InfoRow label="Empresa" value={quote.company} />}
              {quote.notes && <InfoRow label="Observações" value={quote.notes} />}
            </dl>
          </section>

          <section className="border-border bg-card rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-semibold">Itens ({quote.items.length})</h2>
            <ul className="divide-border divide-y">
              {quote.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={ROUTES.productDetail(item.product.slug)}
                      className="hover:text-foreground text-sm font-medium"
                    >
                      {item.product.name}
                    </Link>
                    {item.flavor && (
                      <span className="text-muted-foreground block text-xs">
                        Sabor: {item.flavor}
                      </span>
                    )}
                    {item.product.status !== "ACTIVE" && (
                      <span className="text-muted-foreground block text-xs">
                        (produto não está mais ativo)
                      </span>
                    )}
                  </div>
                  <span className="text-sm tabular-nums">
                    Qtd.: <strong>{item.quantity}</strong>
                    {item.unit ? ` ${item.unit}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="border-border bg-card h-fit rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Atendimento</h2>
          <QuoteDetailManager
            quoteId={quote.id}
            currentStatus={quote.status}
            currentHandledById={quote.handledBy?.id ?? null}
            handlerOptions={handlerOptions}
          />
        </aside>
      </div>
    </div>
  );
}
