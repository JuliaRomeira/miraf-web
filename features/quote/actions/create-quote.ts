"use server";

import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { checkRateLimit, registerAttempt } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { quoteSchema } from "@/features/quote/schemas/quote-schema";
import { createQuote, NoValidItemsError } from "@/features/quote/services/quote-service";
import { sendQuoteEmails } from "@/features/quote/services/quote-email";
import type { ActionResult } from "@/types";

/**
 * Limite de envios de cotação por IP: no máximo 5 a cada 10 minutos.
 * Barreira anti-spam junto do honeypot (o site é público e sem captcha).
 */
const QUOTE_RATE_LIMIT = { limit: 5, windowMs: 10 * 60_000 } as const;

/** Nome do campo honeypot (oculto; humanos não preenchem). */
const HONEYPOT_FIELD = "company_website";

export interface QuoteSuccess {
  readonly protocol: string;
}

/**
 * Parse defensivo dos itens vindos do carrinho (hidden field JSON). Nunca
 * lança — dados inválidos viram lista vazia e a validação Zod reprova.
 */
function parseItems(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Server Action do formulário público de cotação.
 *
 * Ordem: IP → rate limit → honeypot → Zod (valida/sanitiza) → service (salva no
 * banco, fonte da verdade) → e-mail (best-effort, degrada graciosamente).
 */
export async function createQuoteAction(
  _prevState: ActionResult<QuoteSuccess>,
  formData: FormData,
): Promise<ActionResult<QuoteSuccess>> {
  // Honeypot: se preenchido, é bot. Erro genérico (não revela o mecanismo).
  const honeypot = formData.get(HONEYPOT_FIELD);
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return actionError("Não foi possível enviar a solicitação. Tente novamente.");
  }

  const ip = await getClientIp();
  const rateLimitKey = `quote:${ip}`;
  const rateLimit = checkRateLimit(rateLimitKey, QUOTE_RATE_LIMIT);
  if (rateLimit.limited) {
    const minutes = Math.ceil(rateLimit.retryAfterSeconds / 60);
    return actionError(`Você enviou muitas solicitações. Tente novamente em ${minutes} minuto(s).`);
  }

  const parsed = quoteSchema.safeParse({
    name: formData.get("name"),
    document: formData.get("document"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company") ?? undefined,
    notes: formData.get("notes") ?? undefined,
    items: parseItems(formData.get("items")),
  });

  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    const quote = await createQuote(parsed.data);
    // Só envios efetivos contam para o rate limit (não penaliza erros de validação).
    registerAttempt(rateLimitKey, QUOTE_RATE_LIMIT);

    // E-mail é best-effort: a cotação já está salva. Nunca falha o fluxo.
    await sendQuoteEmails(quote);

    return actionSuccess<QuoteSuccess>({ protocol: quote.protocol });
  } catch (error) {
    if (error instanceof NoValidItemsError) {
      return actionError(
        "Os produtos da sua cotação não estão mais disponíveis. Revise sua lista e tente novamente.",
      );
    }
    console.error("[cotação] Falha ao criar cotação:", error);
    return actionError("Não foi possível enviar sua cotação. Tente novamente em instantes.");
  }
}
