import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/features/auth/services/current-user";
import { createUserAction } from "@/features/user/actions/user-actions";
import { UserForm } from "@/features/user/components/user-form";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Novo usuário",
};

export default async function NewUserPage(): Promise<React.ReactElement> {
  const currentUser = await getCurrentUser();

  if (currentUser?.role !== "ADMIN") {
    redirect(ROUTES.admin.dashboard);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-2">
        <Link
          href={ROUTES.admin.users}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft className="size-4" />
          Voltar para usuários
        </Link>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Novo usuário</h1>
      </div>

      <UserForm action={createUserAction} submitLabel="Criar usuário" />
    </div>
  );
}
