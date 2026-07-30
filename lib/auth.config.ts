import type { NextAuthConfig } from "next-auth";

/**
 * Configuração do Auth.js compatível com o Edge Runtime.
 *
 * Usada pelo `middleware.ts`, que roda no Edge e não suporta módulos
 * Node.js (o driver `pg` do Prisma, usado pelo `authorize()` do provider
 * de credenciais, depende de `crypto`). Por isso este arquivo NÃO importa
 * nada relacionado a Prisma/bcrypt e o array `providers` fica vazio aqui —
 * os providers reais são adicionados em `lib/auth.ts`, que roda em runtime
 * Node (Server Components, Server Actions, Route Handlers).
 *
 * @see https://authjs.dev/guides/edge-compatibility
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = Boolean(auth?.user);
      const isOnAdmin = request.nextUrl.pathname.startsWith("/admin");

      // A página de login vive em `/login`, fora do matcher `/admin/:path*`
      // do middleware, então nem chega a este callback. Aqui só resta
      // proteger as rotas administrativas.
      if (isOnAdmin) {
        return isLoggedIn;
      }

      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
