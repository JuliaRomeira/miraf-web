"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { revalidatePublicCatalog } from "@/lib/revalidate-catalog";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

import { productSchema } from "../schemas/product-schema";
import { createProduct, deleteProduct, updateProduct } from "../services/product-service";

function extractProductInput(formData: FormData): Record<string, unknown> {
  const optional = (key: string): string | undefined => {
    const value = formData.get(key);
    const text = typeof value === "string" ? value.trim() : "";
    return text === "" ? undefined : text;
  };

  const orderRaw = formData.get("order");

  let images: unknown = [];
  const imagesRaw = formData.get("images");
  if (typeof imagesRaw === "string" && imagesRaw.trim() !== "") {
    try {
      images = JSON.parse(imagesRaw);
    } catch {
      images = [];
    }
  }

  // Tabela nutricional: hidden field com JSON do objeto, ou "null" (sem tabela).
  let nutrition: unknown = null;
  const nutritionRaw = formData.get("nutrition");
  if (typeof nutritionRaw === "string" && nutritionRaw.trim() !== "" && nutritionRaw !== "null") {
    try {
      nutrition = JSON.parse(nutritionRaw);
    } catch {
      nutrition = null;
    }
  }

  // Sabores: hidden field com JSON do array (mesmo padrão das imagens).
  let flavors: unknown = [];
  const flavorsRaw = formData.get("flavors");
  if (typeof flavorsRaw === "string" && flavorsRaw.trim() !== "") {
    try {
      flavors = JSON.parse(flavorsRaw);
    } catch {
      flavors = [];
    }
  }

  // Destaques: textarea com um item por linha → array (linhas vazias descartadas).
  const highlightsRaw = formData.get("highlights");
  const highlights =
    typeof highlightsRaw === "string"
      ? highlightsRaw
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line !== "")
      : [];

  // Produtos relacionados: hidden field com JSON de ids (mesmo padrão das imagens).
  let relatedProductIds: unknown = [];
  const relatedRaw = formData.get("relatedProductIds");
  if (typeof relatedRaw === "string" && relatedRaw.trim() !== "") {
    try {
      relatedProductIds = JSON.parse(relatedRaw);
    } catch {
      relatedProductIds = [];
    }
  }

  return {
    nutrition,
    flavors,
    highlights,
    relatedProductIds,
    name: optional("name") ?? "",
    description: optional("description") ?? "",
    shortDescription: optional("shortDescription"),
    composition: optional("composition"),
    application: optional("application"),
    conservation: optional("conservation"),
    preparation: optional("preparation"),
    technicalSheetUrl: optional("technicalSheetUrl"),
    weight: optional("weight"),
    sku: optional("sku"),
    packaging: optional("packaging"),
    saleUnit: optional("saleUnit") ?? "unidade",
    status: optional("status") ?? "DRAFT",
    featured: formData.get("featured") === "on",
    order: typeof orderRaw === "string" && orderRaw.trim() !== "" ? Number(orderRaw) : 0,
    categoryId: optional("categoryId") ?? "",
    subcategoryId: optional("subcategoryId"),
    supplierId: optional("supplierId"),
    images,
  };
}

/**
 * A porção é obrigatória em qualquer tabela ativa (do produto ou de um sabor).
 * Retorna a mensagem de erro, ou `null` se tudo certo.
 */
function validateNutritionServings(input: {
  nutrition: { servingAmount: string } | null;
  flavors: readonly { name: string; nutrition: { servingAmount: string } | null }[];
}): string | null {
  if (input.nutrition && input.nutrition.servingAmount.trim() === "") {
    return "Informe a porção (ex.: 50 g) da tabela nutricional.";
  }
  const flavor = input.flavors.find(
    (item) => item.nutrition && item.nutrition.servingAmount.trim() === "",
  );
  if (flavor) {
    return `Informe a porção (ex.: 50 g) da tabela nutricional do sabor "${flavor.name}".`;
  }
  return null;
}

export async function createProductAction(
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "product" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = productSchema.safeParse(extractProductInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  const servingsError = validateNutritionServings(parsed.data);
  if (servingsError) {
    return actionError(servingsError);
  }

  try {
    await createProduct(parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao criar produto.");
  }

  revalidatePath(ROUTES.admin.products);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.products);
}

export async function updateProductAction(
  id: string,
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "product" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = productSchema.safeParse(extractProductInput(formData));
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  const servingsError = validateNutritionServings(parsed.data);
  if (servingsError) {
    return actionError(servingsError);
  }

  try {
    await updateProduct(id, parsed.data);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao salvar produto.");
  }

  revalidatePath(ROUTES.admin.products);
  revalidatePublicCatalog();
  redirect(ROUTES.admin.products);
}

export async function deleteProductAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "product" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteProduct(id);
  } catch (error) {
    return actionError(error instanceof Error ? error.message : "Erro ao excluir produto.");
  }

  revalidatePath(ROUTES.admin.products);
  revalidatePublicCatalog();
  return actionSuccess();
}
