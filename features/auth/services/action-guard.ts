import { getCurrentUser, type CurrentUser } from "@/features/auth/services/current-user";
import { consumeRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * Guard compartilhado das mutating actions do painel administrativo.
 *
 * Padroniza a defesa em profundidade que antes vivia solta em cada feature
 * (`requireUser` em cotações, `requireAdminId` em usuários): exige usuário
 * logado e ativo, opcionalmente restringe a ADMIN e aplica rate limit por IP.
 * O middleware + o layout já protegem `/admin/*`; este guard garante que
 * nenhuma escrita rode sem checagem mesmo se aquelas camadas forem contornadas.
 */

/**
 * Limite das ações de escrita do painel: 40 operações por minuto, por escopo e
 * por IP. Folgado o suficiente para nunca atrapalhar um admin real (é mais de
 * uma operação a cada 2 segundos, de forma sustentada), servindo apenas de teto
 * contra abuso/automação. Em memória, como os demais limitadores (ver
 * `lib/rate-limit.ts`).
 */
const ADMIN_WRITE_RATE_LIMIT = { limit: 40, windowMs: 60_000 } as const;

export type WriteGuardResult =
  | { readonly ok: true; readonly user: CurrentUser }
  | { readonly ok: false; readonly message: string };

interface WriteGuardOptions {
  /**
   * Escopo do rate limit (ex.: "category", "product"). Compõe a chave junto do
   * IP, para que operações distintas não disputem o mesmo balde.
   */
  readonly scope: string;
  /** Quando `true`, apenas ADMIN pode prosseguir (ex.: gestão de usuários). */
  readonly adminOnly?: boolean;
}

/**
 * Autoriza uma mutating action do painel. Em caso de bloqueio devolve uma
 * mensagem pronta para `actionError`; em caso de sucesso, o usuário logado
 * (útil para regras que precisam do id, como as proteções anti-lockout).
 */
export async function guardAdminWrite({
  scope,
  adminOnly = false,
}: WriteGuardOptions): Promise<WriteGuardResult> {
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false, message: "Sua sessão expirou. Faça login novamente para continuar." };
  }

  if (adminOnly && user.role !== "ADMIN") {
    return { ok: false, message: "Apenas administradores podem executar esta ação." };
  }

  const ip = await getClientIp();
  const rateLimit = consumeRateLimit(`admin-write:${scope}:${ip}`, ADMIN_WRITE_RATE_LIMIT);
  if (rateLimit.limited) {
    return {
      ok: false,
      message: `Muitas operações em sequência. Tente novamente em ${rateLimit.retryAfterSeconds}s.`,
    };
  }

  return { ok: true, user };
}
