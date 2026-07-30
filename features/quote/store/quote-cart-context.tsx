"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Carrinho de cotação — estado no cliente, persistido em `localStorage`.
 *
 * Decisão (ver Sessão 03): o usuário não é autenticado e o site não é
 * e-commerce, então persistir cotações não enviadas no banco criaria lixo e
 * exigiria sessão. Guardamos apenas o mínimo para exibir a lista sem novo
 * fetch. A fonte da verdade continua o servidor: no envio, o service revalida
 * os produtos pelo `productId` (existem? estão `ACTIVE`?) e o sabor escolhido —
 * nunca confiamos em nome/imagem/estado vindos daqui.
 *
 * Sabores: um produto pode ser adicionado em vários sabores. Cada sabor é uma
 * linha própria do carrinho, identificada por `productId + flavorId`.
 */

/** Item mínimo persistido no carrinho (uma linha = um produto + sabor). */
export interface QuoteCartItem {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  /** URL da imagem da linha (do sabor, ou capa do produto). */
  readonly imageUrl: string | null;
  /** Sabor escolhido; `null` para produtos sem sabores. */
  readonly flavorId: string | null;
  readonly flavorName: string | null;
  /** Unidade de venda do produto (ex.: "caixa", "unidade"). */
  readonly unit: string;
  readonly quantity: number;
}

/** Dados suficientes para adicionar uma linha ao carrinho. */
export type QuoteCartInput = Omit<QuoteCartItem, "quantity">;

interface QuoteCartContextValue {
  readonly items: readonly QuoteCartItem[];
  /** Soma das quantidades — usado no badge do cabeçalho. */
  readonly itemCount: number;
  /** Nº de linhas distintas (produto+sabor). */
  readonly lineCount: number;
  /** `true` só após hidratar do `localStorage` (evita mismatch SSR/CSR). */
  readonly hydrated: boolean;
  readonly isInCart: (productId: string, flavorId?: string | null) => boolean;
  /** Adiciona `quantity` (soma à linha existente do mesmo produto+sabor). */
  readonly addItem: (input: QuoteCartInput, quantity?: number) => void;
  readonly removeItem: (productId: string, flavorId?: string | null) => void;
  /** Define a quantidade absoluta da linha; `<= 0` remove. */
  readonly setQuantity: (productId: string, flavorId: string | null, quantity: number) => void;
  readonly clear: () => void;
}

const STORAGE_KEY = "mira:quote-cart";
const MAX_QUANTITY = 9999;

const QuoteCartContext = createContext<QuoteCartContextValue | null>(null);

/** Chave única de uma linha (produto + sabor). */
function lineKey(productId: string, flavorId: string | null): string {
  return `${productId}::${flavorId ?? ""}`;
}

function sameLine(item: QuoteCartItem, productId: string, flavorId: string | null): boolean {
  return item.productId === productId && (item.flavorId ?? null) === (flavorId ?? null);
}

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.floor(quantity)));
}

/** Lê e valida o carrinho salvo. Descarta dados corrompidos silenciosamente. */
function readStoredCart(): QuoteCartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const items: QuoteCartItem[] = [];
    for (const entry of parsed) {
      if (typeof entry !== "object" || entry === null) continue;
      const candidate = entry as Record<string, unknown>;
      if (
        typeof candidate.productId === "string" &&
        typeof candidate.slug === "string" &&
        typeof candidate.name === "string" &&
        typeof candidate.quantity === "number"
      ) {
        items.push({
          productId: candidate.productId,
          slug: candidate.slug,
          name: candidate.name,
          imageUrl: typeof candidate.imageUrl === "string" ? candidate.imageUrl : null,
          flavorId: typeof candidate.flavorId === "string" ? candidate.flavorId : null,
          flavorName: typeof candidate.flavorName === "string" ? candidate.flavorName : null,
          unit: typeof candidate.unit === "string" ? candidate.unit : "",
          quantity: clampQuantity(candidate.quantity),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

interface QuoteCartProviderProps {
  readonly children: React.ReactNode;
}

export function QuoteCartProvider({ children }: QuoteCartProviderProps): React.ReactElement {
  const [items, setItems] = useState<readonly QuoteCartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hidrata do localStorage só no cliente, após a montagem.
  useEffect(() => {
    setItems(readStoredCart());
    setHydrated(true);
  }, []);

  // Persiste a cada mudança (somente depois de hidratar, para não sobrescrever
  // o valor salvo com o estado inicial vazio).
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Sem espaço / modo privado: ignoramos — o carrinho segue em memória.
    }
  }, [items, hydrated]);

  // Sincroniza entre abas.
  useEffect(() => {
    function onStorage(event: StorageEvent): void {
      if (event.key === STORAGE_KEY) {
        setItems(readStoredCart());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addItem = useCallback((input: QuoteCartInput, quantity = 1): void => {
    setItems((current) => {
      const existing = current.find((item) => sameLine(item, input.productId, input.flavorId));
      if (existing) {
        return current.map((item) =>
          sameLine(item, input.productId, input.flavorId)
            ? { ...item, quantity: clampQuantity(item.quantity + quantity) }
            : item,
        );
      }
      return [...current, { ...input, quantity: clampQuantity(quantity) }];
    });
  }, []);

  const removeItem = useCallback((productId: string, flavorId: string | null = null): void => {
    setItems((current) => current.filter((item) => !sameLine(item, productId, flavorId)));
  }, []);

  const setQuantity = useCallback(
    (productId: string, flavorId: string | null, quantity: number): void => {
      setItems((current) => {
        if (quantity <= 0) {
          return current.filter((item) => !sameLine(item, productId, flavorId));
        }
        return current.map((item) =>
          sameLine(item, productId, flavorId)
            ? { ...item, quantity: clampQuantity(quantity) }
            : item,
        );
      });
    },
    [],
  );

  const clear = useCallback((): void => {
    setItems([]);
  }, []);

  const value = useMemo<QuoteCartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const lines = new Set(items.map((item) => lineKey(item.productId, item.flavorId)));
    return {
      items,
      itemCount,
      lineCount: items.length,
      hydrated,
      isInCart: (productId: string, flavorId: string | null = null) =>
        lines.has(lineKey(productId, flavorId)),
      addItem,
      removeItem,
      setQuantity,
      clear,
    };
  }, [items, hydrated, addItem, removeItem, setQuantity, clear]);

  return <QuoteCartContext.Provider value={value}>{children}</QuoteCartContext.Provider>;
}

/** Hook de acesso ao carrinho. Lança se usado fora do Provider. */
export function useQuoteCart(): QuoteCartContextValue {
  const context = useContext(QuoteCartContext);
  if (!context) {
    throw new Error("useQuoteCart deve ser usado dentro de <QuoteCartProvider>.");
  }
  return context;
}
