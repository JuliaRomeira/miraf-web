"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";
import { actionError, actionFromZodError, actionSuccess } from "@/lib/action-result";
import { checkRateLimit, clearRateLimit, registerAttempt } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { loginSchema } from "@/features/auth/schemas/login-schema";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

/**
 * Limite de tentativas de login por IP: no máximo 5 falhas a cada 60s.
 * Só falhas contam — logins bem-sucedidos não penalizam o usuário.
 */
const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60_000 } as const;

/**
 * Server Action do formulário de login do painel administrativo.
 *
 * Antes de validar credenciais, aplica rate limiting por IP (proteção contra
 * força bruta). Em seguida delega a validação ao `authorize()` configurado em
 * `lib/auth.ts` (via `signIn`). Em caso de sucesso, o próprio `signIn`
 * redireciona para o dashboard — por isso o retorno de sucesso nunca chega
 * a ser lido pelo client.
 */
export async function loginAction(
  _prevState: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const ip = await getClientIp();
  const rateLimitKey = `login:${ip}`;

  const rateLimit = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT);
  if (rateLimit.limited) {
    return actionError(
      `Muitas tentativas de login. Tente novamente em ${rateLimit.retryAfterSeconds}s.`,
    );
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return actionFromZodError(parsed.error);
  }

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: ROUTES.admin.dashboard,
    });
    // Inatingível na prática: `signIn` com `redirectTo` lança NEXT_REDIRECT
    // em caso de sucesso. Mantido por completude do tipo de retorno.
    clearRateLimit(rateLimitKey);
    return actionSuccess();
  } catch (error) {
    if (error instanceof AuthError) {
      registerAttempt(rateLimitKey, LOGIN_RATE_LIMIT);
      return actionError("Email ou senha inválidos.");
    }
    throw error;
  }
}
