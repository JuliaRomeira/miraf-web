"use client";

import Link from "next/link";
import { Plus, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useQuoteCart, type QuoteCartInput } from "@/features/quote/store/quote-cart-context";
import { ROUTES } from "@/constants";

interface CardAddToQuoteButtonProps {
  readonly product: QuoteCartInput;
  /** Produto tem sabores? Nesse caso o card leva ao detalhe (escolher o sabor lá). */
  readonly hasFlavors: boolean;
}

/**
 * Botão compacto de "adicionar à cotação" para os cards da listagem — reduz o
 * atrito no funil principal (não exige abrir a página de detalhe). Compartilha
 * o mesmo carrinho (Context + localStorage) do botão da página de produto.
 *
 * - Produto COM sabores: não dá para escolher o sabor no card, então vira um
 *   link "Escolher sabor" que abre o detalhe.
 * - Produto sem sabores, já na cotação: stepper ligado ao carrinho (o `[−]` em 1
 *   remove) — ajusta a quantidade ali mesmo sem abrir "Minha cotação".
 */
export function CardAddToQuoteButton({
  product,
  hasFlavors,
}: CardAddToQuoteButtonProps): React.ReactElement {
  const { items, addItem, setQuantity, removeItem } = useQuoteCart();

  if (hasFlavors) {
    return (
      <Button
        asChild
        size="sm"
        variant="outline"
        className="border-brand/30 text-brand hover:bg-brand hover:text-brand-foreground hover:border-brand w-full font-semibold transition-all duration-200 active:scale-[0.98]"
      >
        <Link href={ROUTES.productDetail(product.slug)}>
          <SlidersHorizontal aria-hidden="true" />
          Escolher sabor
        </Link>
      </Button>
    );
  }

  const cartItem = items.find(
    (item) => item.productId === product.productId && item.flavorId === null,
  );

  if (cartItem) {
    return (
      <QuantityStepper
        value={cartItem.quantity}
        onChange={(next) => setQuantity(product.productId, null, next)}
        onRemove={() => removeItem(product.productId, null)}
        label={`Quantidade de ${product.name} na cotação`}
        size="sm"
        className="w-full justify-center"
      />
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="border-brand/30 text-brand hover:bg-brand hover:text-brand-foreground hover:border-brand w-full font-semibold transition-all duration-200 active:scale-[0.98]"
      onClick={() => addItem(product)}
      aria-label={`Adicionar ${product.name} à cotação`}
    >
      <Plus aria-hidden="true" />
      Adicionar à cotação
    </Button>
  );
}
