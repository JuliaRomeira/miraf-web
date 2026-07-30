import {
  Building2,
  ClipboardList,
  FolderTree,
  LayoutDashboard,
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

export interface AdminNavItem extends NavItem {
  readonly icon: LucideIcon;
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
  { label: "Dashboard", href: ROUTES.admin.dashboard, icon: LayoutDashboard },
  { label: "Produtos", href: ROUTES.admin.products, icon: Package },
  { label: "Categorias", href: ROUTES.admin.categories, icon: FolderTree },
  { label: "Fornecedores", href: ROUTES.admin.suppliers, icon: Building2 },
  { label: "Cotações", href: ROUTES.admin.quotes, icon: ClipboardList },
  { label: "Usuários", href: ROUTES.admin.users, icon: Users, adminOnly: true },
  { label: "Configurações", href: ROUTES.admin.settings, icon: Settings, adminOnly: true },
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
