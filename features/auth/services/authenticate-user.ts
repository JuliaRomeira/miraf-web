import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import type { LoginInput } from "@/features/auth/schemas/login-schema";

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Valida email/senha contra o banco e retorna os dados do usuário
 * autenticado, ou `null` se as credenciais forem inválidas.
 *
 * Usuários inativos (`active: false`) não conseguem autenticar, mesmo
 * com a senha correta.
 */
export async function authenticateUser({
  email,
  password,
}: LoginInput): Promise<AuthenticatedUser | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.active) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return null;
  }

  return { id: user.id, name: user.name, email: user.email };
}
