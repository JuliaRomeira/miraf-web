"use server";

import { revalidatePath } from "next/cache";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { guardAdminWrite } from "@/features/auth/services/action-guard";
import { updateQuoteSchema } from "@/features/quote/schemas/quote-admin-schema";
import { deleteQuote, updateQuote } from "@/features/quote/services/quote-admin-service";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

// Cotações podem ser atendidas por ADMIN ou EDITOR (ver papéis no schema):
// basta estar logado e ativo, por isso o guard não usa `adminOnly`.

export async function updateQuoteAction(
  id: string,
  _prev: ActionResult<void> | null,
  formData: FormData,
): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "quote" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  const parsed = updateQuoteSchema.safeParse({
    status: formData.get("status"),
    handledById: typeof formData.get("handledById") === "string" ? formData.get("handledById") : "",
  });
  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await updateQuote(id, parsed.data);
  } catch (error) {
    console.error("[cotação] Falha ao atualizar cotação:", error);
    return actionError("Não foi possível salvar as alterações. Tente novamente.");
  }

  revalidatePath(ROUTES.admin.quotes);
  revalidatePath(`${ROUTES.admin.quotes}/${id}`);
  return actionSuccess();
}

export async function deleteQuoteAction(id: string): Promise<ActionResult<void>> {
  const guard = await guardAdminWrite({ scope: "quote" });
  if (!guard.ok) {
    return actionError(guard.message);
  }

  try {
    await deleteQuote(id);
  } catch (error) {
    console.error("[cotação] Falha ao excluir cotação:", error);
    return actionError("Não foi possível excluir a cotação. Tente novamente.");
  }

  revalidatePath(ROUTES.admin.quotes);
  return actionSuccess();
}
