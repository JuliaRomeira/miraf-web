import type { ZodError } from "zod";

import type { ActionFailure } from "@/types";

/**
 * Converte um erro do Zod no formato padrão de resposta de Server Action.
 *
 * O array `issues` do Zod é achatado em um objeto `fieldErrors` do tipo
 * `{ "campo.aninhado": ["erro1", "erro2"] }`, adequado para exibir
 * mensagens de erro por campo em formulários no client.
 */
export function actionFromZodError(error: ZodError): ActionFailure {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!key) continue;
    if (!fieldErrors[key]) {
      fieldErrors[key] = [];
    }
    fieldErrors[key].push(issue.message);
  }

  return {
    success: false,
    error: "Dados inválidos. Verifique os campos destacados.",
    fieldErrors,
  };
}

/**
 * Fabrica uma resposta de erro genérica para Server Actions.
 * Use quando o erro não vier do Zod (ex.: falha ao salvar no banco).
 */
export function actionError(message: string): ActionFailure {
  return { success: false, error: message };
}

/**
 * Fabrica uma resposta de sucesso para Server Actions.
 */
export function actionSuccess(): { success: true; data: void };
export function actionSuccess<TData>(data: TData): { success: true; data: TData };
export function actionSuccess<TData>(data?: TData) {
  return { success: true, data: data as TData };
}
