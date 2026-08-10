import Link from "next/link";
import { redirect } from "next/navigation";
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
import { getCurrentUser } from "@/features/auth/services/current-user";
import { deleteUserAction } from "@/features/user/actions/user-actions";
import { listUsers } from "@/features/user/services/user-service";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Usuários",
};

const ROLE_LABEL: Record<"ADMIN" | "EDITOR", string> = {
  ADMIN: "Administrador",
  EDITOR: "Editor",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" });

export default async function UsersPage(): Promise<React.ReactElement> {
  const currentUser = await getCurrentUser();

  // Apenas administradores gerenciam usuários (EDITOR não tem acesso).
  if (currentUser?.role !== "ADMIN") {
    redirect(ROUTES.admin.dashboard);
  }

  const users = await listUsers();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Usuários"
        description="Gerencie quem tem acesso ao painel administrativo."
      >
        <Button asChild>
          <Link href={`${ROUTES.admin.users}/novo`}>
            <Plus />
            Novo usuário
          </Link>
        </Button>
      </AdminPageHeader>

      <div className="border-border bg-card shadow-soft overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUser.id;

              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name}
                    {isSelf && (
                      <span className="bg-muted text-muted-foreground ml-2 rounded px-1.5 py-0.5 text-xs">
                        Você
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{ROLE_LABEL[user.role]}</TableCell>
                  <TableCell>
                    <StatusBadge tone={user.active ? "success" : "neutral"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dateFormatter.format(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" aria-label="Editar usuário">
                        <Link href={`${ROUTES.admin.users}/${user.id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      {/* Excluir a própria conta é bloqueado — não exibimos o botão. */}
                      {!isSelf && (
                        <DeleteButton
                          action={deleteUserAction.bind(null, user.id)}
                          itemLabel={`o usuário "${user.name}"`}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
