import { headers } from "next/headers";

/**
 * Extrai o IP do cliente a partir dos cabeçalhos da requisição.
 *
 * Em produção o app roda atrás do Nginx (ver deploy no CLAUDE.md), então o
 * IP real chega em `x-forwarded-for` (o primeiro item da lista, que é o
 * cliente original — os demais são proxies). `x-real-ip` é usado como
 * fallback. Retorna `"unknown"` quando nenhum cabeçalho está presente, o que
 * agrupa requisições sem IP identificável sob uma única chave de rate limit.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();

  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstIp] = forwardedFor.split(",");
    if (firstIp?.trim()) {
      return firstIp.trim();
    }
  }

  const realIp = headerList.get("x-real-ip");
  if (realIp?.trim()) {
    return realIp.trim();
  }

  return "unknown";
}
