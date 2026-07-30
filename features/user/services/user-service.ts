import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

import type { CreateUserInput, UpdateUserInput } from "../schemas/user-schema";

/** Camada de dados/negócio de usuários do painel. */

// Mesmo custo usado no seed (`prisma/seed.ts`) — manter alinhado.
const SALT_ROUNDS = 12;

async function isEmailTaken(email: string, excludeId?: string): Promise<boolean> {
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  return existing !== null && existing.id !== excludeId;
}

/** Existe outro administrador ativo além de `excludeId`? Evita lockout. */
async function otherActiveAdminsExist(excludeId: string): Promise<boolean> {
  const count = await prisma.user.count({
    where: { role: "ADMIN", active: true, NOT: { id: excludeId } },
  });
  return count > 0;
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
}

export async function createUser(input: CreateUserInput): Promise<{ id: string }> {
  if (await isEmailTaken(input.email)) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  const password = await bcrypt.hash(input.password, SALT_ROUNDS);

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      active: input.active,
      password,
    },
    select: { id: true },
  });
}

export async function updateUser(
  id: string,
  input: UpdateUserInput,
  currentUserId: string,
): Promise<{ id: string }> {
  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, active: true },
  });

  if (!target) {
    throw new Error("Usuário não encontrado.");
  }

  if (await isEmailTaken(input.email, id)) {
    throw new Error("Já existe um usuário com este e-mail.");
  }

  // O usuário está deixando de ser um administrador ativo?
  const losingAdminAccess =
    target.role === "ADMIN" && target.active && (input.role !== "ADMIN" || !input.active);

  if (id === currentUserId && losingAdminAccess) {
    throw new Error("Você não pode remover nem desativar o próprio acesso de administrador.");
  }

  if (losingAdminAccess && !(await otherActiveAdminsExist(id))) {
    throw new Error("Não é possível remover o último administrador ativo do sistema.");
  }

  // Senha só é alterada quando informada; em branco mantém a atual.
  const password = input.password ? await bcrypt.hash(input.password, SALT_ROUNDS) : undefined;

  return prisma.user.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      active: input.active,
      ...(password ? { password } : {}),
    },
    select: { id: true },
  });
}

export async function deleteUser(id: string, currentUserId: string): Promise<void> {
  if (id === currentUserId) {
    throw new Error("Você não pode excluir a própria conta.");
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true, active: true },
  });

  if (!target) {
    throw new Error("Usuário não encontrado.");
  }

  if (target.role === "ADMIN" && target.active && !(await otherActiveAdminsExist(id))) {
    throw new Error("Não é possível excluir o último administrador ativo do sistema.");
  }

  // Quote → handledBy usa onDelete: SetNull, então excluir um usuário apenas
  // desvincula as cotações que ele atendeu (o histórico é preservado).
  await prisma.user.delete({ where: { id } });
}
