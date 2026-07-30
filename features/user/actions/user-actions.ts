"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

import { createUserSchema, updateUserSchema } from "../schemas/user-schema";
import { createUser, deleteUser, updateUser } from "../services/user-service";

function extractUserInput(formData: FormData, passwordOptional: boolean): Record<string, unknown> {
  const text = (key: string): string => {
    const value = formData.get(key);
    return typeof value === "string" ? value.trim() : "";
  };

  const rawPassword = text("password");

  return {
    name: text("name"),
    email: text("email"),
    role: text("role"),
    active: formData.get("active") === "on",
    // Na edição, senha em branco significa "manter a atual".
    password: passwordOptional && rawPassword === "" ? undefined : rawPassword,
  };
}

export async function createUserAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "user", adminOnly: true });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = createUserSchema.safeParse(extractUserInput(formData, false));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await createUser(parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao criar usuário.");
  }

  revalidatePath(ROUTES.admin.users);
  redirect(ROUTES.admin.users);
}

export async function updateUserAction(
  id: string,
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "user", adminOnly: true });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = updateUserSchema.safeParse(extractUserInput(formData, true));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await updateUser(id, parsed.data, guard.user.id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar usuário.");
  }

  revalidatePath(ROUTES.admin.users);
  redirect(ROUTES.admin.users);
}

export async function deleteUserAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "user", adminOnly: true });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteUser(id, guard.user.id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao excluir usuário.");
  }

  revalidatePath(ROUTES.admin.users);
  return actionSuccess();
}
