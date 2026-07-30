import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { updateSupplierAction } from "@/features/supplier/actions/supplier-actions";
import { SupplierForm } from "@/features/supplier/components/supplier-form";
import { getSupplierById } from "@/features/supplier/services/supplier-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Editar fornecedor",
};

interface EditSupplierPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditSupplierPage({
  params,
}: EditSupplierPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const supplier = await getSupplierById(id);

  if (!supplier) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.suppliers}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para fornecedores
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Editar fornecedor</h1>
      </div>

      <SupplierForm
        action={updateSupplierAction.bind(null, id)}
        submitLabel="Salvar alterações"
        initial={{
          name: supplier.name,
          logoUrl: supplier.logoUrl ?? "",
          description: supplier.description ?? "",
          order: supplier.order,
          active: supplier.active,
        }}
      />
    </div>
  );
}
