import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Middleware de proteção de rotas administrativas.
 *
 * Usa apenas `authConfig` (edge-safe), nunca `lib/auth.ts` — importar a
 * config completa aqui traria o provider de credenciais (Prisma/bcrypt)
 * para o bundle do Edge Runtime, que não suporta módulos Node.js.
 */
const { auth } = NextAuth(authConfig);

export { auth as middleware };

/**
 * Restringe a execução do middleware apenas às rotas relevantes,
 * evitando overhead em assets estáticos e rotas públicas.
 */
export const config = {
  matcher: ["/admin/:path*"],
};
