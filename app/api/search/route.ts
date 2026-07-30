import { NextResponse } from "next/server";

import { searchCatalog } from "@/features/catalog/services/catalog-service";

/**
 * Busca global do site público (autocomplete do cabeçalho). GET, sem auth —
 * expõe apenas o catálogo ativo (produtos por nome/código, categorias e
 * fornecedores). Lê o parâmetro `?q=` e devolve as sugestões em JSON.
 *
 * O consumo é sob demanda (o usuário digitando), então não cacheamos a resposta.
 */
export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  const results = await searchCatalog(q);

  return NextResponse.json(results, {
    headers: { "Cache-Control": "no-store" },
  });
}
