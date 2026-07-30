import { redirect } from "next/navigation";

import { ROUTES } from "@/constants";

/**
 * A página dedicada de fornecedores foi removida (decisão da cliente): os
 * fornecedores agora aparecem só no carrossel da home e na seção da página de
 * produtos. Esta rota é mantida apenas para não quebrar links/bookmarks
 * antigos — redireciona para a listagem de produtos.
 */
export default function SuppliersRedirectPage(): never {
  redirect(ROUTES.products);
}
