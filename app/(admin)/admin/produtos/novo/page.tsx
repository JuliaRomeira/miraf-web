import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createProductAction } from "@/features/product/actions/product-actions";
import { ProductForm } from "@/features/product/components/product-form";
import { listProductOptions } from "@/features/product/services/product-service";
import { listSupplierOptions } from "@/features/supplier/services/supplier-service";
import { listCategoryTree } from "@/features/category/services/category-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Novo produto",
};

export default async function NewProductPage(): Promise<React.ReactElement> {
  const [categories, supplierOptions, productOptions] = await Promise.all([
    listCategoryTree(),
    listSupplierOptions(),
    listProductOptions(),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.products}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para produtos
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Novo produto</h1>
      </div>

      <ProductForm
        action={createProductAction}
        categories={categories}
        supplierOptions={supplierOptions}
        productOptions={productOptions}
        submitLabel="Criar produto"
      />
    </div>
  );
}
