"use server";

import { signOut } from "@/lib/auth";
import { ROUTES } from "@/constants";

/**
 * Encerra a sessão do painel e redireciona para a tela de login.
 * Usada pelo botão "Sair" da topbar administrativa.
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: ROUTES.admin.login });
}
