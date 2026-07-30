import { randomUUID } from "node:crypto";

import { prisma } from "@/lib/prisma";
import type { QuoteInput } from "@/features/quote/schemas/quote-schema";

/**
 * Camada de dados da cotação. É a fonte da verdade: revalida os produtos no
 * banco antes de gravar (nunca confia no que veio do cliente) e gera o
 * protocolo de forma atômica.
 */

/** Chave da linha de `Settings` usada como contador sequencial do protocolo. */
const QUOTE_SEQUENCE_KEY = "quote_sequence";
const PROTOCOL_PREFIX = "ORC";
const PROTOCOL_PAD = 6;

/** Item da cotação já resolvido contra o banco (com nome do produto). */
export interface ResolvedQuoteItem {
  readonly productId: string;
  readonly name: string;
  /** Código interno (SKU) do produto; `null` quando o produto não tem. */
  readonly sku: string | null;
  /** Nome do sabor escolhido (snapshot do banco); `null` = produto sem sabor. */
  readonly flavor: string | null;
  /** Unidade de venda do produto (ex.: "caixa"). */
  readonly unit: string;
  readonly quantity: number;
}

export interface CreateQuoteResult {
  readonly id: string;
  readonly protocol: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly document: string;
  readonly documentType: "CPF" | "CNPJ";
  readonly company?: string;
  readonly notes?: string;
  readonly items: readonly ResolvedQuoteItem[];
  /** Itens descartados por não existirem mais ou não estarem ativos. */
  readonly droppedCount: number;
}

/** Erro de negócio: nenhum item válido restou após revalidar os produtos. */
export class NoValidItemsError extends Error {
  constructor() {
    super("Nenhum dos produtos da cotação está disponível.");
    this.name = "NoValidItemsError";
  }
}

/**
 * Incrementa (atômico) o contador do protocolo dentro da transação e devolve
 * o próximo valor. O `ON CONFLICT ... DO UPDATE` serializa incrementos
 * concorrentes no nível da linha, sem corrida.
 */
async function nextProtocolNumber(tx: PrismaTransaction): Promise<number> {
  const rows = await tx.$queryRaw<{ value: string }[]>`
    INSERT INTO "Settings" ("id", "key", "value", "createdAt", "updatedAt")
    VALUES (${randomUUID()}, ${QUOTE_SEQUENCE_KEY}, '1', now(), now())
    ON CONFLICT ("key")
      DO UPDATE SET "value" = ((("Settings"."value")::int) + 1)::text, "updatedAt" = now()
    RETURNING "value";
  `;
  return Number(rows[0]?.value ?? "1");
}

function formatProtocol(sequence: number): string {
  return `${PROTOCOL_PREFIX}-${String(sequence).padStart(PROTOCOL_PAD, "0")}`;
}

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Cria uma cotação a partir dos dados já validados/sanitizados pela Server
 * Action. Tudo acontece em uma transação: revalidação dos produtos → protocolo
 * → gravação de `Quote` + `QuoteItem`s.
 */
export async function createQuote(input: QuoteInput): Promise<CreateQuoteResult> {
  return prisma.$transaction(async (tx) => {
    // 1. Revalidar produtos: só os que existem e estão ACTIVE entram. Traz os
    //    sabores para resolver o nome do sabor escolhido e a unidade de venda —
    //    a fonte da verdade é o banco (nunca confiamos no rótulo vindo do cliente).
    const requestedIds = input.items.map((item) => item.productId);
    const activeProducts = await tx.product.findMany({
      where: { id: { in: requestedIds }, status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        sku: true,
        saleUnit: true,
        flavors: { select: { id: true, name: true } },
      },
    });
    const productById = new Map(activeProducts.map((product) => [product.id, product]));

    // Preserva a quantidade informada; ignora itens inválidos. Deduplica por
    // produto+sabor (o carrinho já evita duplicar). Um produto pode aparecer em
    // várias linhas — uma por sabor.
    const seen = new Set<string>();
    const resolvedItems: ResolvedQuoteItem[] = [];
    for (const item of input.items) {
      const product = productById.get(item.productId);
      if (!product) continue;

      // Resolve o sabor: se o produto tem sabores e um foi escolhido, precisa
      // existir (descartado se foi removido). Produto sem sabores ignora flavorId.
      let flavor: string | null = null;
      if (product.flavors.length > 0 && item.flavorId) {
        const match = product.flavors.find((f) => f.id === item.flavorId);
        if (!match) continue; // sabor não existe mais → descarta a linha
        flavor = match.name;
      }

      const key = `${item.productId}::${flavor ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);

      resolvedItems.push({
        productId: item.productId,
        name: product.name,
        sku: product.sku,
        flavor,
        unit: product.saleUnit,
        quantity: item.quantity,
      });
    }

    if (resolvedItems.length === 0) {
      throw new NoValidItemsError();
    }

    // 2. Protocolo atômico.
    const protocol = formatProtocol(await nextProtocolNumber(tx));

    // 3. Gravar cotação + itens.
    const quote = await tx.quote.create({
      data: {
        protocol,
        name: input.name,
        documentType: input.documentType,
        document: input.document,
        email: input.email,
        phone: input.phone,
        company: input.company,
        notes: input.notes,
        items: {
          create: resolvedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            flavor: item.flavor,
            unit: item.unit,
          })),
        },
      },
      select: { id: true, protocol: true },
    });

    return {
      id: quote.id,
      protocol: quote.protocol,
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      documentType: input.documentType,
      company: input.company,
      notes: input.notes,
      items: resolvedItems,
      droppedCount: requestedIds.length - resolvedItems.length,
    };
  });
}
