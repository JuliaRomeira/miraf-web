import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import { authenticateUser } from "@/features/auth/services/authenticate-user";

/**
 * Configuração completa do Auth.js (NextAuth v5), com os providers reais.
 *
 * Estende `authConfig` (edge-safe) com o provider de credenciais, que
 * depende de Prisma/bcrypt — por isso só pode ser usado em runtime Node
 * (Server Components, Server Actions, Route Handlers), nunca no
 * `middleware.ts`. Ver `lib/auth.config.ts` para o porquê da separação.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        return await authenticateUser(parsed.data);
      },
    }),
  ],
});
