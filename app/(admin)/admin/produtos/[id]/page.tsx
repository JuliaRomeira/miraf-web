import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateProductAction } from "@/features/product/actions/product-actions";
import { ProductForm } from "@/features/product/components/product-form";
import { getProductById, listProductOptions } from "@/features/product/services/product-service";
import { toNutritionFormData } from "@/features/product/utils/nutrition-form-data";
import { listSupplierOptions } from "@/features/supplier/services/supplier-service";
import { listCategoryTree } from "@/features/category/services/category-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Editar produto",
};

interface EditProductPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [categories, supplierOptions, productOptions] = await Promise.all([
    listCategoryTree(),
    listSupplierOptions(),
    listProductOptions(id),
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Editar produto</h1>
      </div>

      <ProductForm
        action={updateProductAction.bind(null, id)}
        categories={categories}
        supplierOptions={supplierOptions}
        productOptions={productOptions}
        submitLabel="Salvar alterações"
        initial={{
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          composition: product.composition ?? "",
          application: product.application ?? "",
          conservation: product.conservation ?? "",
          preparation: product.preparation ?? "",
          technicalSheetUrl: product.technicalSheetUrl ?? "",
          highlights: product.highlights,
          weight: product.weight ?? "",
          sku: product.sku ?? "",
          packaging: product.packaging ?? "",
          saleUnit: product.saleUnit,
          status: product.status,
          featured: product.featured,
          order: product.order,
          categoryId: product.categoryId,
          subcategoryId: product.subcategoryId ?? "",
          supplierId: product.supplierId ?? "",
          images: product.images.map((image) => ({ url: image.url, isPrimary: image.isPrimary })),
          flavors: product.flavors.map((flavor) => ({
            name: flavor.name,
            images: flavor.images.map((image) => ({ url: image.url, isPrimary: image.isPrimary })),
            sku: flavor.sku ?? "",
            weight: flavor.weight ?? "",
            description: flavor.description ?? "",
            technicalSheetUrl: flavor.technicalSheetUrl ?? "",
            available: flavor.available,
            nutrition: toNutritionFormData(flavor.nutrition),
          })),
          nutrition: product.nutrition
            ? { enabled: true, ...toNutritionFormData(product.nutrition)! }
            : null,
          relatedProductIds: product.relatedProducts.map((related) => related.id),
        }}
      />
    </div>
  );
}
