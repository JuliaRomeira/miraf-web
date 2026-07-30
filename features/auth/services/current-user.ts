import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: "ADMIN" | "EDITOR";
  readonly active: boolean;
}

/**
 * Retorna o usuário logado (dados frescos do banco), ou `null` se não houver
 * sessão ou o usuário estiver inativo.
 *
 * Lê o `role` direto do banco a cada chamada, em vez de guardá-lo no JWT: é
 * uma consulta barata e garante que mudanças de papel/ativação tenham efeito
 * imediato, sem exigir novo login.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user || !user.active) {
    return null;
  }

  return user;
}
