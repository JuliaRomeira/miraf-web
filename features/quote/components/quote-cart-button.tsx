"use client";

import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuoteCart } from "@/features/quote/store/quote-cart-context";
import { ROUTES } from "@/constants";

interface QuoteCartButtonProps {
  readonly className?: string;
  /** Chamado ao clicar — usado para fechar o menu mobile ao navegar. */
  readonly onNavigate?: () => void;
}

/**
 * CTA "Minha cotação" com badge de contador. É o eixo de conversão do site.
 * O badge só aparece após hidratar o carrinho (evita mismatch SSR/CSR) e
 * quando há itens.
 */
export function QuoteCartButton({
  className,
  onNavigate,
}: QuoteCartButtonProps): React.ReactElement {
  const { itemCount, hydrated } = useQuoteCart();
  const showBadge = hydrated && itemCount > 0;
  const badgeLabel = itemCount > 99 ? "99+" : String(itemCount);

  return (
    <Button
      asChild
      size="default"
      className={cn(
        "bg-brand text-brand-foreground hover:bg-brand/90 hover:shadow-brand/30 relative rounded-full font-semibold shadow-sm transition-all duration-200 ease-out hover:scale-[1.03] hover:shadow-md",
        className,
      )}
    >
      <Link
        href={ROUTES.quote}
        onClick={onNavigate}
        aria-label={
          showBadge
            ? `Minha cotação, ${itemCount} ${itemCount === 1 ? "item" : "itens"}`
            : "Minha cotação"
        }
      >
        <ClipboardList />
        Minha cotação
        {showBadge && (
          <span
            className="bg-background text-foreground border-background absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full border px-1 text-xs font-semibold shadow-sm"
            aria-hidden="true"
          >
            {badgeLabel}
          </span>
        )}
      </Link>
    </Button>
  );
}
