"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { revalidatePublicCatalog } from "@/lib/revalidate-catalog";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

import { categorySchema } from "../schemas/category-schema";
import {
  createCategory,
  createSubcategory,
  deleteCategory,
  deleteSubcategory,
  updateCategory,
  updateSubcategory,
} from "../services/category-service";

/** Extrai e normaliza os campos do formulário de categoria. */
function extractCategoryInput(formData: FormData): Record<string, unknown> {
  const optional = (key: string): string | undefined => {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    return text === "" ? undefined : text;
  };

  const orderRaw = formData.get("order");

  return {
    name: optional("name") ?? "",
    description: optional("description"),
    imageUrl: optional("imageUrl"),
    bannerUrl: optional("bannerUrl"),
    parentId: optional("parentId"),
    order: typeof orderRaw === "string" && orderRaw.trim() !== "" ? Number(orderRaw) : 0,
    active: formData.get("active") === "on",
  };
}

export async function createCategoryAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = categorySchema.safeParse(extractCategoryInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await createCategory(parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao criar categoria.");
  }

  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.categories);
}

export async function updateCategoryAction(
  id: string,
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = categorySchema.safeParse(extractCategoryInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await updateCategory(id, parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar categoria.");
  }

  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.categories);
}

export async function deleteCategoryAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteCategory(id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao excluir categoria.");
  }

  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  return actionSuccess();
}

// ---------------------------------------------------------------------------
// Subcategorias — gerenciadas dentro do cadastro da categoria principal. Estas
// actions NÃO redirecionam: retornam ActionResult para o gerenciador embutido
// (client) atualizar a lista na hora (via router.refresh()).
// ---------------------------------------------------------------------------

/** Valida o nome de uma (sub)categoria; retorna a mensagem de erro ou null. */
function validateSubcategoryName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return "Informe ao menos 2 caracteres.";
  }
  if (trimmed.length > 100) {
    return "Máximo de 100 caracteres.";
  }
  return null;
}

export async function createSubcategoryAction(
  parentId: string,
  name: string,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const nameError = validateSubcategoryName(name);
  if (nameError) {
    return actionError(nameError);
  }

  try {
    await createSubcategory(parentId, name);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao criar subcategoria.");
  }

  revalidatePath(`${ROUTES.admin.categories}/${parentId}`);
  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  return actionSuccess();
}

export async function updateSubcategoryAction(
  id: string,
  data: { name: string; active: boolean },
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const nameError = validateSubcategoryName(data.name);
  if (nameError) {
    return actionError(nameError);
  }

  try {
    await updateSubcategory(id, { name: data.name, active: data.active });
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar subcategoria.");
  }

  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  return actionSuccess();
}

export async function deleteSubcategoryAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "category" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteSubcategory(id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao excluir subcategoria.");
  }

  revalidatePath(ROUTES.admin.categories);
  revalidatePublicCatalog();
  return actionSuccess();
}
