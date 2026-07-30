/**
 * Rate limiter em memória (janela fixa).
 *
 * Escolha deliberada: o deploy-alvo é Docker standalone em uma única VPS
 * (processo Node único), então um `Map` em memória é suficiente para conter
 * força bruta sem adicionar Redis/Upstash. Limitações conhecidas e aceitas
 * neste cenário:
 *  - o contador zera quando o processo reinicia (redeploy);
 *  - não é compartilhado entre múltiplas instâncias/réplicas.
 * Se o projeto passar a escalar horizontalmente, trocar o `store` por um
 * backend compartilhado mantendo esta mesma interface.
 */

export interface RateLimitOptions {
  /** Máximo de ocorrências permitidas dentro da janela. */
  readonly limit: number;
  /** Duração da janela em milissegundos. */
  readonly windowMs: number;
}

export interface RateLimitResult {
  /** `true` quando o limite foi atingido e a ação deve ser bloqueada. */
  readonly limited: boolean;
  /** Segundos até a janela reabrir (0 quando não está limitado). */
  readonly retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

/**
 * Acima deste tamanho, uma varredura remove buckets já expirados para
 * evitar crescimento ilimitado do `Map` (ex.: muitos IPs distintos).
 */
const PRUNE_THRESHOLD = 10_000;

function pruneExpired(now: number): void {
  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) {
      store.delete(key);
    }
  }
}

function secondsUntil(resetAt: number, now: number): number {
  return Math.max(0, Math.ceil((resetAt - now) / 1000));
}

/**
 * Consulta o estado atual sem registrar uma nova ocorrência.
 * Use antes de executar a ação protegida.
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (bucket.count >= options.limit) {
    return { limited: true, retryAfterSeconds: secondsUntil(bucket.resetAt, now) };
  }

  return { limited: false, retryAfterSeconds: 0 };
}

/**
 * Registra uma ocorrência (ex.: uma tentativa de login malsucedida).
 * Reinicia a janela quando a anterior já expirou.
 */
export function registerAttempt(key: string, options: RateLimitOptions): void {
  const now = Date.now();

  if (store.size > PRUNE_THRESHOLD) {
    pruneExpired(now);
  }

  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return;
  }

  bucket.count += 1;
}

/**
 * Verifica o limite e, se ainda houver folga, já registra a ocorrência —
 * atalho para o caso em que **toda** tentativa conta (ex.: ações de escrita do
 * painel), ao contrário do login, onde só falhas contam. Devolve o resultado
 * da verificação: quando `limited` é `true`, nada foi registrado.
 */
export function consumeRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const result = checkRateLimit(key, options);
  if (result.limited) {
    return result;
  }

  registerAttempt(key, options);
  return { limited: false, retryAfterSeconds: 0 };
}

/**
 * Limpa o contador de uma chave (ex.: após um login bem-sucedido).
 */
export function clearRateLimit(key: string): void {
  store.delete(key);
}
