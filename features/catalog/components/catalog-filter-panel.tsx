import { CatalogSearchField } from "@/features/catalog/components/catalog-search-field";
import { CategoryFilter } from "@/features/catalog/components/category-filter";
import {
  SupplierSection,
  type SectionSupplier,
} from "@/features/catalog/components/supplier-section";

interface CategoryNode {
  readonly slug: string;
  readonly name: string;
  readonly children: readonly { readonly slug: string; readonly name: string }[];
}

interface CatalogFilterPanelProps {
  readonly categories: readonly CategoryNode[];
  readonly suppliers: readonly SectionSupplier[];
}

/**
 * Painel único de filtros do catálogo — card branco, cantos arredondados, sombra
 * discreta. Reúne busca, categorias (pills, 2 níveis) e fornecedores (logos) num
 * só bloco, no lugar dos controles antes espalhados pela página. É apresentacional
 * (Server Component); os controles internos cuidam do estado na URL.
 */
export function CatalogFilterPanel({
  categories,
  suppliers,
}: CatalogFilterPanelProps): React.ReactElement {
  return (
    <div className="border-border/60 bg-card space-y-4 rounded-[20px] border p-5 shadow-[0_18px_50px_-28px_rgba(14,44,98,0.3)] sm:p-6">
      <CatalogSearchField />

      <div className="space-y-2.5">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Categorias
        </h3>
        <CategoryFilter categories={categories} />
      </div>

      {suppliers.length > 0 && <SupplierSection suppliers={suppliers} />}
    </div>
  );
}
