import type { DefaultSession } from "next-auth";

/**
 * Extensão dos tipos padrão do Auth.js.
 *
 * Por padrão, `session.user` não possui `id`. Como o painel administrativo
 * precisa identificar o usuário autenticado (ex.: para auditoria de quem
 * criou/editou um produto ou cotação), estendemos o tipo aqui.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
