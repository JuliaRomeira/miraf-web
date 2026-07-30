import type { QuoteStatus } from "@prisma/client";

import { cn } from "@/lib/utils";
import {
  QUOTE_STATUS_BADGE_CLASS,
  QUOTE_STATUS_LABEL,
} from "@/features/quote/constants/quote-status";

/** Badge de status de cotação. Reutilizado pelo Dashboard e pela aba Cotações. */
export function QuoteStatusBadge({ status }: { status: QuoteStatus }): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        QUOTE_STATUS_BADGE_CLASS[status],
      )}
    >
      {QUOTE_STATUS_LABEL[status]}
    </span>
  );
}
