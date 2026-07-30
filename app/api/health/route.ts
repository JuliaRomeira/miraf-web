import { NextResponse } from "next/server";

/**
 * Endpoint de health check.
 *
 * Utilizado pelo Docker HEALTHCHECK e por ferramentas externas de monitoramento
 * (uptime, load balancer). Retorna 200 quando o processo Next.js está de pé.
 *
 * Não faz consulta ao banco de propósito — a intenção é verificar apenas se o
 * processo web está respondendo. Um endpoint separado (`/api/health/db`) pode
 * ser criado depois para verificar conectividade com PostgreSQL, se necessário.
 */
export const dynamic = "force-dynamic";

export function GET(): NextResponse {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
