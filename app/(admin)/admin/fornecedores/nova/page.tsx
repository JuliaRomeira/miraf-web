import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { createSupplierAction } from "@/features/supplier/actions/supplier-actions";
import { SupplierForm } from "@/features/supplier/components/supplier-form";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Novo fornecedor",
};

export default function NewSupplierPage(): React.ReactElement {
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Novo fornecedor</h1>
      </div>

      <SupplierForm action={createSupplierAction} submitLabel="Criar fornecedor" />
    </div>
  );
}
