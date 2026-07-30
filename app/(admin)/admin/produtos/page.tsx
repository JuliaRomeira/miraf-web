import Link from "next/link";
import Image from "next/image";
import { Pencil, Plus, Search } from "lucide-react";

import { AdminPagination } from "@/components/shared/admin-pagination";
import { DeleteButton } from "@/components/shared/delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nativeSelectClass } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteProductAction } from "@/features/product/actions/product-actions";
import { listProducts } from "@/features/product/services/product-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Produtos",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
};

const STATUS_VALUES = ["DRAFT", "ACTIVE", "INACTIVE"] as const;
type ProductStatusValue = (typeof STATUS_VALUES)[number];

interface ProductsPageProps {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function readParam(value: string | string[] | undefined): string | undefined {
  const text = Array.isArray(value) ? value[0] : value;
  return text && text.trim() !== "" ? text.trim() : undefined;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps): Promise<React.ReactElement> {
  const params = await searchParams;
  const q = readParam(params.q);
  const statusRaw = readParam(params.status);
  const status = STATUS_VALUES.includes(statusRaw as ProductStatusValue)
    ? (statusRaw as ProductStatusValue)
    : undefined;
  const page = Number(readParam(params.page)) || 1;

  const result = await listProducts({ q, status, page });
  const hasFilters = Boolean(q) || Boolean(status);

  const makeHref = (targetPage: number): string => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (status) sp.set("status", status);
    if (targetPage > 1) sp.set("page", String(targetPage));
    const qs = sp.toString();
    return qs ? `${ROUTES.admin.products}?${qs}` : ROUTES.admin.products;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-muted-foreground text-sm">Gerencie o catálogo de produtos.</p>
        </div>
        <Button asChild>
          <Link href={`${ROUTES.admin.products}/novo`}>
            <Plus />
            Novo produto
          </Link>
        </Button>
      </header>

      {/* Filtros (form GET, funciona sem JS): busca por nome/código + status. */}
      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Buscar por nome ou código..."
            aria-label="Buscar produtos"
            className="pl-9"
          />
        </div>
        <select
          name="status"
          defaultValue={status ?? ""}
          aria-label="Filtrar por status"
          className={`${nativeSelectClass} sm:w-48`}
        >
          <option value="">Todos os status</option>
          {STATUS_VALUES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABEL[value]}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <Button type="submit" variant="outline">
            Filtrar
          </Button>
          {hasFilters && (
            <Button asChild variant="ghost">
              <Link href={ROUTES.admin.products}>Limpar</Link>
            </Button>
          )}
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          {hasFilters
            ? "Nenhum produto encontrado com os filtros aplicados."
            : "Nenhum produto cadastrado ainda. Crie o primeiro para montar o catálogo."}
        </div>
      ) : (
        <>
          <div className="border-border rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-14">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((product) => {
                  const cover = product.images[0]?.url;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="bg-muted relative size-10 overflow-hidden rounded">
                          {cover && (
                            <Image src={cover} alt="" fill sizes="40px" className="object-cover" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                        {product.featured && (
                          <span className="text-muted-foreground ml-2 text-xs">★ destaque</span>
                        )}
                        <span className="text-muted-foreground block text-xs">{product.slug}</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.supplier?.name ?? "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            product.status === "ACTIVE"
                              ? "text-green-600 dark:text-green-500"
                              : "text-muted-foreground"
                          }
                        >
                          {STATUS_LABEL[product.status] ?? product.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" aria-label="Editar produto">
                            <Link href={`${ROUTES.admin.products}/${product.id}`}>
                              <Pencil className="size-4" />
                            </Link>
                          </Button>
                          <DeleteButton
                            action={deleteProductAction.bind(null, product.id)}
                            itemLabel={`o produto "${product.name}"`}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <AdminPagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
        </>
      )}
    </div>
  );
}
