import Link from "next/link";
import { Building2, Clock, FolderTree, LifeBuoy, Package, Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/constants";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import {
  getDashboardStats,
  getRecentQuotes,
} from "@/features/dashboard/services/dashboard-service";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { RecentQuotes } from "@/features/dashboard/components/recent-quotes";
import { QuoteStatusSummary } from "@/features/dashboard/components/quote-status-summary";

export const metadata = {
  title: "Dashboard",
};

/**
 * Dashboard do painel administrativo: visão geral de cotações e catálogo.
 * Server Component — os números vêm do dashboard-service (só leitura).
 */
export default async function AdminDashboardPage(): Promise<React.ReactElement> {
  const [session, stats, recentQuotes] = await Promise.all([
    auth(),
    getDashboardStats(),
    getRecentQuotes(),
  ]);

  const displayName = session?.user?.name ?? session?.user?.email ?? "";

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={`Bem-vindo(a)${displayName ? `, ${displayName}` : ""}`}
        description="Aqui está um resumo da operação e atalhos para as tarefas do dia a dia."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cotações pendentes"
          value={stats.quotes.byStatus.PENDING}
          icon={Clock}
          hint={`${stats.quotes.recent} nos últimos 30 dias`}
          href={ROUTES.admin.quotes}
          tone="attention"
        />
        <StatCard
          label="Produtos ativos"
          value={stats.products.byStatus.ACTIVE}
          icon={Package}
          hint={`de ${stats.products.total} no catálogo`}
          href={ROUTES.admin.products}
        />
        <StatCard
          label="Categorias"
          value={stats.categories}
          icon={FolderTree}
          href={ROUTES.admin.categories}
        />
        <StatCard
          label="Fornecedores"
          value={stats.suppliers}
          icon={Building2}
          href={ROUTES.admin.suppliers}
        />
      </div>

      {/* Ações rápidas — atalhos para as tarefas mais comuns. */}
      <section className="bg-card shadow-soft rounded-xl border p-5">
        <h2 className="font-display text-base font-semibold">Ações rápidas</h2>
        <p className="text-muted-foreground mt-0.5 text-sm">Comece uma tarefa em um clique.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild>
            <Link href={`${ROUTES.admin.products}/novo`}>
              <Plus />
              Novo produto
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${ROUTES.admin.categories}/nova`}>
              <Plus />
              Nova categoria
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`${ROUTES.admin.suppliers}/nova`}>
              <Plus />
              Novo fornecedor
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={ROUTES.admin.quotes}>Ver cotações</Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentQuotes quotes={recentQuotes} />
        </div>
        <div className="lg:col-span-2">
          <QuoteStatusSummary byStatus={stats.quotes.byStatus} total={stats.quotes.total} />
        </div>
      </div>

      {/* Dica de ajuda — sempre convida a aprender a usar o painel. */}
      <section className="border-primary/20 bg-accent/50 flex flex-col gap-4 rounded-xl border p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="bg-brand text-brand-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <LifeBuoy className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold">É a primeira vez por aqui?</h2>
            <p className="text-muted-foreground text-sm">
              Veja o passo a passo de como usar o painel. Você também encontra ajuda a qualquer
              momento no botão <span className="font-medium">?</span> no topo da tela.
            </p>
          </div>
        </div>
        <Button asChild variant="brand" className="shrink-0">
          <Link href={ROUTES.admin.help}>Abrir manual</Link>
        </Button>
      </section>
    </div>
  );
}
