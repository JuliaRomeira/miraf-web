import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

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
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie as categorias principais. As subcategorias ficam dentro de cada categoria.
          </p>
        </div>
        <Button asChild>
          <Link href={`${ROUTES.admin.categories}/nova`}>
            <Plus />
            Nova categoria
          </Link>
        </Button>
      </header>

      {categories.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Nenhuma categoria cadastrada ainda. Crie a primeira para começar o catálogo.
        </div>
      ) : (
        <div className="border-border rounded-lg border">
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
                    <span
                      className={
                        category.active
                          ? "text-green-600 dark:text-green-500"
                          : "text-muted-foreground"
                      }
                    >
                      {category.active ? "Ativa" : "Inativa"}
                    </span>
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
