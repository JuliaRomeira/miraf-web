"use client";

import Link from "next/link";
import Image from "next/image";
import { ImageOff, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { useQuoteCart } from "@/features/quote/store/quote-cart-context";
import { ROUTES } from "@/constants";

/**
 * Lista editável dos itens da cotação: imagem, nome, quantidade (stepper) e
 * remover. Também permite esvaziar tudo. Lê e escreve diretamente no carrinho.
 */
export function QuoteItemList(): React.ReactElement {
  const { items, setQuantity, removeItem, clear, lineCount } = useQuoteCart();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {lineCount} {lineCount === 1 ? "produto" : "produtos"}
        </h2>
        <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground">
          <Trash2 className="size-4" />
          Esvaziar
        </Button>
      </div>

      <ul className="divide-border border-border divide-y rounded-lg border">
        {items.map((item) => (
          <li
            key={`${item.productId}::${item.flavorId ?? ""}`}
            className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
          >
            <div className="bg-muted relative size-14 shrink-0 overflow-hidden rounded-md sm:size-16">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex h-full items-center justify-center">
                  <ImageOff className="size-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <Link
                href={ROUTES.productDetail(item.slug)}
                className="hover:text-foreground line-clamp-2 text-sm font-medium"
              >
                {item.name}
              </Link>
              {(item.flavorName || item.unit) && (
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {item.flavorName ? `Sabor: ${item.flavorName}` : ""}
                  {item.flavorName && item.unit ? " · " : ""}
                  {item.unit ? `Vendido por ${item.unit}` : ""}
                </p>
              )}
            </div>

            <QuantityStepper
              value={item.quantity}
              onChange={(next) => setQuantity(item.productId, item.flavorId, next)}
              onRemove={() => removeItem(item.productId, item.flavorId)}
              label={`Quantidade de ${item.name}${item.flavorName ? ` sabor ${item.flavorName}` : ""}`}
              size="sm"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive size-8"
              aria-label={`Remover ${item.name}${item.flavorName ? ` sabor ${item.flavorName}` : ""}`}
              onClick={() => removeItem(item.productId, item.flavorId)}
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
