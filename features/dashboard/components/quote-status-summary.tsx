import type { QuoteStatus } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  QUOTE_STATUS_BAR_CLASS,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_ORDER,
} from "@/features/quote/constants/quote-status";

interface QuoteStatusSummaryProps {
  byStatus: Record<QuoteStatus, number>;
  total: number;
}

/** Distribuição das cotações por status, com barra proporcional ao total. */
export function QuoteStatusSummary({
  byStatus,
  total,
}: QuoteStatusSummaryProps): React.ReactElement {
  return (
    <section className="bg-card text-card-foreground border-border rounded-lg border">
      <header className="border-border border-b px-5 py-4">
        <h2 className="text-base font-semibold">Cotações por status</h2>
        <p className="text-muted-foreground text-sm">Distribuição de todas as solicitações.</p>
      </header>

      <ul className="space-y-4 px-5 py-5">
        {QUOTE_STATUS_ORDER.map((status) => {
          const count = byStatus[status];
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li key={status}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{QUOTE_STATUS_LABEL[status]}</span>
                <span className="text-muted-foreground tabular-nums">{count}</span>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div
                  className={cn("h-full rounded-full", QUOTE_STATUS_BAR_CLASS[status])}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
