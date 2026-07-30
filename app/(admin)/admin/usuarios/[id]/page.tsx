import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/features/auth/services/current-user";
import { updateUserAction } from "@/features/user/actions/user-actions";
import { UserForm } from "@/features/user/components/user-form";
import { getUserById } from "@/features/user/services/user-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Editar usuário",
};

interface EditUserPageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function EditUserPage({
  params,
}: EditUserPageProps): Promise<React.ReactElement> {
  const currentUser = await getCurrentUser();

  if (currentUser?.role !== "ADMIN") {
    redirect(ROUTES.admin.dashboard);
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
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
        <h1 className="font-display text-2xl font-semibold tracking-tight">Editar usuário</h1>
      </div>

      <UserForm
        action={updateUserAction.bind(null, id)}
        submitLabel="Salvar alterações"
        initial={{
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
        }}
      />
    </div>
  );
}
