import Link from "next/link";
import Image from "next/image";
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
import { deleteSupplierAction } from "@/features/supplier/actions/supplier-actions";
import { listSuppliers } from "@/features/supplier/services/supplier-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Fornecedores",
};

export default async function SuppliersPage(): Promise<React.ReactElement> {
  const suppliers = await listSuppliers();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Fornecedores" description="Gerencie os fornecedores parceiros.">
        <Button asChild>
          <Link href={`${ROUTES.admin.suppliers}/nova`}>
            <Plus />
            Novo fornecedor
          </Link>
        </Button>
      </AdminPageHeader>

      {suppliers.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
          Nenhum fornecedor cadastrado ainda.
        </div>
      ) : (
        <div className="border-border bg-card shadow-soft overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Logo</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Produtos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <div className="bg-muted relative size-10 overflow-hidden rounded">
                      {supplier.logoUrl && (
                        <Image
                          src={supplier.logoUrl}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-contain"
                        />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {supplier.name}
                    <span className="text-muted-foreground block text-xs">{supplier.slug}</span>
                  </TableCell>
                  <TableCell className="text-right">{supplier._count.products}</TableCell>
                  <TableCell>
                    <StatusBadge tone={supplier.active ? "success" : "neutral"}>
                      {supplier.active ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="Editar fornecedor">
                        <Link href={`${ROUTES.admin.suppliers}/${supplier.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <DeleteButton
                        action={deleteSupplierAction.bind(null, supplier.id)}
                        itemLabel={`o fornecedor "${supplier.name}"`}
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
