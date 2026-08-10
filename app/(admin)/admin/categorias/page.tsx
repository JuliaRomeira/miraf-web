import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { DeleteButton } from "@/components/shared/delete-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategoryAction } from "@/features/category/actions/category-actions";
import { listCategories } from "@/features/category/services/category-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Categorias",
};

export default async function CategoriesPage(): Promise<React.ReactElement> {
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categorias"
        description="Gerencie as categorias principais. As subcategorias ficam dentro de cada categoria."
      >
        <Button asChild>
          <Link href={`${ROUTES.admin.categories}/nova`}>
            <Plus />
            Nova categoria
          </Link>
        </Button>
      </AdminPageHeader>

      {categories.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Nenhuma categoria cadastrada ainda. Crie a primeira para começar o catálogo.
        </div>
      ) : (
        <div className="border-border bg-card shadow-soft overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Subcategorias</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead className="text-right">Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    {category.name}
                    <span className="text-muted-foreground block text-xs">{category.slug}</span>
                  </TableCell>
                  <TableCell className="text-right">{category.children.length}</TableCell>
                  <TableCell className="text-right">{category._count.products}</TableCell>
                  <TableCell className="text-right">{category.order}</TableCell>
                  <TableCell>
                    <StatusBadge tone={category.active ? "success" : "neutral"}>
                      {category.active ? "Ativa" : "Inativa"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        aria-label="Editar categoria e subcategorias"
                      >
                        <Link href={`${ROUTES.admin.categories}/${category.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        action={deleteCategoryAction.bind(null, category.id)}
                        itemLabel={`a categoria "${category.name}"`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
