"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { revalidatePublicCatalog } from "@/lib/revalidate-catalog";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

import { supplierSchema } from "../schemas/supplier-schema";
import { createSupplier, deleteSupplier, updateSupplier } from "../services/supplier-service";

function extractSupplierInput(formData: FormData): Record<string, unknown> {
  const optional = (key: string): string | undefined => {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    return text === "" ? undefined : text;
  };

  const orderRaw = formData.get("order");

  return {
    name: optional("name") ?? "",
    logoUrl: optional("logoUrl"),
    description: optional("description"),
    order: typeof orderRaw === "string" && orderRaw.trim() !== "" ? Number(orderRaw) : 0,
    active: formData.get("active") === "on",
  };
}

export async function createSupplierAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "supplier" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = supplierSchema.safeParse(extractSupplierInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await createSupplier(parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao criar fornecedor.");
  }

  revalidatePath(ROUTES.admin.suppliers);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.suppliers);
}

export async function updateSupplierAction(
  id: string,
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "supplier" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = supplierSchema.safeParse(extractSupplierInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await updateSupplier(id, parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar fornecedor.");
  }

  revalidatePath(ROUTES.admin.suppliers);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.suppliers);
}

export async function deleteSupplierAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "supplier" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteSupplier(id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao excluir fornecedor.");
  }

  revalidatePath(ROUTES.admin.suppliers);
  revalidatePublicCatalog();
  return actionSuccess();
}
