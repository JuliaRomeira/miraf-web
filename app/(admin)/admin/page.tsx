import { redirect } from "next/navigation";

import { ROUTES } from "@/constants";

/**
 * Rota raiz do painel (`/admin`). Não tem tela própria: usuários logados
 * caem direto no dashboard; usuários sem sessão nem chegam aqui, pois o
 * middleware já os redireciona para `/login`.
 */
export default function AdminRootPage(): never {
  redirect(ROUTES.admin.dashboard);
}
