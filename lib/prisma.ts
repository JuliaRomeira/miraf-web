import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

/**
 * Singleton do Prisma Client.
 *
 * Em desenvolvimento, o Next.js recarrega módulos a cada mudança de arquivo
 * (Fast Refresh). Sem esse padrão, cada reload criaria uma nova instância do
 * PrismaClient, esgotando as conexões disponíveis do PostgreSQL.
 *
 * Armazenamos a instância no objeto global (apenas em dev) para reutilizá-la
 * entre reloads. Em produção, uma única instância é criada normalmente.
 *
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/help-articles/nextjs-prisma-client-dev-practices
 *
 * A partir do Prisma 7, o schema não aceita mais `url` no bloco `datasource`
 * — a conexão precisa ser feita via driver adapter, passado explicitamente
 * ao construtor do client.
 * @see https://pris.ly/d/prisma7-client-config
 */

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
