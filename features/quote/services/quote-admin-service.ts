import type { QuoteStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { UpdateQuoteInput } from "@/features/quote/schemas/quote-admin-schema";

/**
 * Camada de dados da gestão de cotações no painel (leitura + atualização de
 * status/responsável + exclusão). Distinta do `quote-service.ts`, que cuida da
 * criação pelo fluxo público.
 */

export interface AdminQuoteListItem {
  readonly id: string;
  readonly protocol: string;
  readonly name: string;
  readonly company: string | null;
  readonly status: QuoteStatus;
  readonly itemCount: number;
  readonly handledByName: string | null;
  readonly createdAt: Date;
}

export interface AdminQuoteListFilters {
  readonly status?: QuoteStatus;
  readonly page?: number;
}

export interface AdminQuoteListResult {
  readonly items: AdminQuoteListItem[];
  readonly total: number;
  readonly page: number;
  readonly totalPages: number;
}

/** Itens por página na listagem de cotações do painel. */
const ADMIN_QUOTES_PER_PAGE = 20;

/**
 * Listagem paginada de cotações para o painel (filtro por status opcional).
 * Paginação no servidor — cotações só acumulam, então a tabela não pode carregar
 * todo o histórico a cada acesso.
 */
export async function listQuotes(
  filters: AdminQuoteListFilters = {},
): Promise<AdminQuoteListResult> {
  const page = Math.max(1, filters.page ?? 1);
  const perPage = ADMIN_QUOTES_PER_PAGE;
  const where = filters.status ? { status: filters.status } : undefined;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        protocol: true,
        name: true,
        company: true,
        status: true,
        createdAt: true,
        handledBy: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.quote.count({ where }),
  ]);

  return {
    items: quotes.map((quote) => ({
      id: quote.id,
      protocol: quote.protocol,
      name: quote.name,
      company: quote.company,
      status: quote.status,
      itemCount: quote._count.items,
      handledByName: quote.handledBy?.name ?? null,
      createdAt: quote.createdAt,
    })),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  };
}

/** Cotação completa para a tela de atendimento (dados + itens + responsável). */
export async function getQuoteById(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      handledBy: { select: { id: true, name: true } },
      items: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          quantity: true,
          flavor: true,
          unit: true,
          product: { select: { name: true, slug: true, status: true } },
        },
      },
    },
  });
}

/** Atualiza status e responsável. `handledById` nulo remove a atribuição. */
export async function updateQuote(id: string, input: UpdateQuoteInput): Promise<void> {
  await prisma.quote.update({
    where: { id },
    data: {
      status: input.status,
      handledById: input.handledById,
    },
  });
}

export async function deleteQuote(id: string): Promise<void> {
  // QuoteItem → Quote é onDelete: Cascade, então os itens somem junto.
  await prisma.quote.delete({ where: { id } });
}
