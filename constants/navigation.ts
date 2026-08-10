import {
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Package,
  Settings,
  Users,
} from "lucide-react";

import { ROUTES } from "@/constants/site";

/**
 * Itens de navegação do site.
 * Fonte única de verdade para os menus — usada por header, footer e sidebar,
 * garantindo consistência e evitando links duplicados/divergentes.
 */

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

/**
 * Seções do menu do painel — agrupam os itens por afinidade (Catálogo,
 * Vendas, Administração), dando hierarquia visual à navegação sem alterar
 * as funcionalidades. A ordem do array define a ordem de exibição.
 */
export type AdminNavGroupId = "painel" | "catalogo" | "vendas" | "admin";

export interface AdminNavItem extends NavItem {
  readonly icon: LucideIcon;
  /** Seção à qual o item pertence (para agrupar na sidebar). */
  readonly group: AdminNavGroupId;
  /** Visível apenas para administradores (ex.: gestão de usuários). */
  readonly adminOnly?: boolean;
}

/** Papéis de acesso ao painel (espelha o enum `UserRole` do Prisma). */
export type AdminRole = "ADMIN" | "EDITOR";

/** Navegação principal do site público. Mantida enxuta (poucos itens). */
export const PUBLIC_NAV_ITEMS: readonly NavItem[] = [
  { label: "Início", href: ROUTES.home },
  { label: "Sobre", href: ROUTES.about },
  { label: "Produtos", href: ROUTES.products },
  { label: "Nossas Unidades", href: ROUTES.units },
];

/** Menus do painel administrativo, na ordem definida no CLAUDE.md. */
export const ADMIN_NAV_ITEMS: readonly AdminNavItem[] = [
  { label: "Dashboard", href: ROUTES.admin.dashboard, icon: LayoutDashboard, group: "painel" },
  { label: "Produtos", href: ROUTES.admin.products, icon: Package, group: "catalogo" },
  { label: "Categorias", href: ROUTES.admin.categories, icon: FolderTree, group: "catalogo" },
  { label: "Fornecedores", href: ROUTES.admin.suppliers, icon: Building2, group: "catalogo" },
  { label: "Cotações", href: ROUTES.admin.quotes, icon: ClipboardList, group: "vendas" },
  {
    label: "Usuários",
    href: ROUTES.admin.users,
    icon: Users,
    group: "admin",
    adminOnly: true,
  },
  {
    label: "Configurações",
    href: ROUTES.admin.settings,
    icon: Settings,
    group: "admin",
    adminOnly: true,
  },
];

/** Item da central de ajuda — fica no rodapé da sidebar, fora dos grupos. */
export const ADMIN_HELP_NAV_ITEM: AdminNavItem = {
  label: "Central de ajuda",
  href: ROUTES.admin.help,
  icon: LifeBuoy,
  group: "painel",
};

/** Rótulos das seções do menu, exibidos como cabeçalho de cada grupo. */
export const ADMIN_NAV_GROUP_LABEL: Record<AdminNavGroupId, string> = {
  painel: "Painel",
  catalogo: "Catálogo",
  vendas: "Vendas",
  admin: "Administração",
};

/** Ordem de exibição das seções na sidebar. */
export const ADMIN_NAV_GROUP_ORDER: readonly AdminNavGroupId[] = [
  "painel",
  "catalogo",
  "vendas",
  "admin",
];

/**
 * Itens do painel visíveis para o papel informado. Esconde os itens
 * `adminOnly` de EDITORes — o gate de segurança (páginas + actions) continua
 * valendo; isto é apenas a camada visual, para não exibir o que o usuário não
 * pode usar.
 */
export function visibleAdminNavItems(role: AdminRole): readonly AdminNavItem[] {
  return ADMIN_NAV_ITEMS.filter((item) => !item.adminOnly || role === "ADMIN");
}

export interface AdminNavGroup {
  readonly id: AdminNavGroupId;
  readonly label: string;
  readonly items: readonly AdminNavItem[];
}

/**
 * Itens visíveis já organizados por seção (para o papel informado), na ordem
 * de `ADMIN_NAV_GROUP_ORDER`. Grupos vazios (todos os itens escondidos) são
 * omitidos. Usado pela sidebar/menu mobile para dar hierarquia visual.
 */
export function visibleAdminNavGroups(role: AdminRole): readonly AdminNavGroup[] {
  const visible = visibleAdminNavItems(role);
  return ADMIN_NAV_GROUP_ORDER.map((id) => ({
    id,
    label: ADMIN_NAV_GROUP_LABEL[id],
    items: visible.filter((item) => item.group === id),
  })).filter((group) => group.items.length > 0);
}
