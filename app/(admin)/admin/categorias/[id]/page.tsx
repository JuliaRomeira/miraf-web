import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateCategoryAction } from "@/features/category/actions/category-actions";
import { CategoryForm } from "@/features/category/components/category-form";
import { SubcategoryManager } from "@/features/category/components/subcategory-manager";
import { getCategoryById, listSubcategories } from "@/features/category/services/category-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Editar categoria",
};

interface EditCategoryPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) {
    notFound();
  }

  const isRoot = category.parentId === null;
  const subcategories = isRoot ? await listSubcategories(id) : [];

  return (
    <div className="max-w-2xl space-y-8">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.categories}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para categorias
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {isRoot ? "Editar categoria" : "Editar subcategoria"}
        </h1>
      </div>

      <CategoryForm
        action={updateCategoryAction.bind(null, id)}
        submitLabel="Salvar alterações"
        initial={{
          name: category.name,
          description: category.description ?? "",
          imageUrl: category.imageUrl ?? "",
          bannerUrl: category.bannerUrl ?? "",
          order: category.order,
          active: category.active,
        }}
      />

      {isRoot && (
        <SubcategoryManager
          parentId={id}
          subcategories={subcategories.map((sub) => ({
            id: sub.id,
            name: sub.name,
            active: sub.active,
            productCount: sub._count.subcategoryProducts,
          }))}
        />
      )}
    </div>
  );
}
