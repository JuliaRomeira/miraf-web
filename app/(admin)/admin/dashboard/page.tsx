import { Building2, Clock, FolderTree, Package } from "lucide-react";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/constants";
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
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo(a){displayName ? `, ${displayName}` : ""}. Aqui está um resumo da operação.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Cotações pendentes"
          value={stats.quotes.byStatus.PENDING}
          icon={Clock}
          hint={`${stats.quotes.recent} nos últimos 30 dias`}
          href={ROUTES.admin.quotes}
          emphasis
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

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <RecentQuotes quotes={recentQuotes} />
        </div>
        <div className="lg:col-span-2">
          <QuoteStatusSummary byStatus={stats.quotes.byStatus} total={stats.quotes.total} />
        </div>
      </div>
    </div>
  );
}
