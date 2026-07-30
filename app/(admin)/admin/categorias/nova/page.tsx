import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createCategoryAction } from "@/features/category/actions/category-actions";
import { CategoryForm } from "@/features/category/components/category-form";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Nova categoria",
};

export default function NewCategoryPage(): React.ReactElement {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.categories}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para categorias
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Nova categoria</h1>
        <p className="text-muted-foreground text-sm">
          Após salvar, você poderá gerenciar as subcategorias na tela de edição.
        </p>
      </div>

      <CategoryForm action={createCategoryAction} submitLabel="Criar categoria" />
    </div>
  );
}
