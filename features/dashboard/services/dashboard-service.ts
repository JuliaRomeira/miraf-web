import type { ProductStatus, QuoteStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Camada de dados do dashboard administrativo. Apenas leitura/agregação —
 * por isso não há Zod nem Server Action (esse fluxo é para escrita). As
 * consultas rodam em paralelo e alimentam os widgets do painel.
 */

const RECENT_QUOTES_LIMIT = 5;
const RECENT_WINDOW_DAYS = 30;

export interface DashboardStats {
  quotes: {
    total: number;
    recent: number;
    byStatus: Record<QuoteStatus, number>;
  };
  products: {
    total: number;
    byStatus: Record<ProductStatus, number>;
  };
  categories: number;
  suppliers: number;
}

export interface RecentQuote {
  id: string;
  protocol: string;
  name: string;
  company: string | null;
  status: QuoteStatus;
  itemCount: number;
  createdAt: Date;
}

/** Zera a contagem de todos os status e sobrepõe os valores realmente presentes. */
function tallyByStatus<T extends string>(
  keys: readonly T[],
  rows: readonly { status: T; _count: { _all: number } }[],
): Record<T, number> {
  const tally = Object.fromEntries(keys.map((key) => [key, 0])) as Record<T, number>;
  for (const row of rows) {
    tally[row.status] = row._count._all;
  }
  return tally;
}

const QUOTE_STATUSES: readonly QuoteStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const PRODUCT_STATUSES: readonly ProductStatus[] = ["DRAFT", "ACTIVE", "INACTIVE"];

export async function getDashboardStats(): Promise<DashboardStats> {
  const since = new Date();
  since.setDate(since.getDate() - RECENT_WINDOW_DAYS);

  const [
    quoteTotal,
    quoteRecent,
    quotesByStatus,
    productTotal,
    productsByStatus,
    categories,
    suppliers,
  ] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { createdAt: { gte: since } } }),
    prisma.quote.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.product.count(),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.category.count(),
    prisma.supplier.count(),
  ]);

  return {
    quotes: {
      total: quoteTotal,
      recent: quoteRecent,
      byStatus: tallyByStatus(QUOTE_STATUSES, quotesByStatus),
    },
    products: {
      total: productTotal,
      byStatus: tallyByStatus(PRODUCT_STATUSES, productsByStatus),
    },
    categories,
    suppliers,
  };
}

export async function getRecentQuotes(): Promise<RecentQuote[]> {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
    take: RECENT_QUOTES_LIMIT,
    select: {
      id: true,
      protocol: true,
      name: true,
      company: true,
      status: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return quotes.map((quote) => ({
    id: quote.id,
    protocol: quote.protocol,
    name: quote.name,
    company: quote.company,
    status: quote.status,
    itemCount: quote._count.items,
    createdAt: quote.createdAt,
  }));
}
