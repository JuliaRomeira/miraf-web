"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

import { settingsSchema } from "../schemas/settings-schema";
import {
  SETTINGS_KEYS,
  SITE_SETTINGS_TAG,
  updateSettings,
  type SettingsKey,
} from "../services/site-settings";

export async function updateSettingsAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "settings", adminOnly: true });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const raw: Record<string, string | undefined> = {};
  for (const key of SETTINGS_KEYS) {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    raw[key] = text === "" ? undefined : text;
  }

  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  // Campos vazios são gravados como "" (limpam o valor no banco).
  const values = {} as Record<SettingsKey, string>;
  for (const key of SETTINGS_KEYS) {
    values[key] = parsed.data[key] ?? "";
  }

  try {
    await updateSettings(values);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar configurações.");
  }

  // Atualiza o cache lido pelo site público (rodapé, hero, WhatsApp...).
  revalidateTag(SITE_SETTINGS_TAG);
  revalidatePath(ROUTES.admin.settings);

  return actionSuccess();
}
