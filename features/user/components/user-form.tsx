"use client";

import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { nativeSelectClass } from "@/components/ui/native-select";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

export interface UserFormValues {
  readonly name: string;
  readonly email: string;
  readonly role: "ADMIN" | "EDITOR";
  readonly active: boolean;
}

interface UserFormProps {
  readonly action: (
    prev: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  readonly submitLabel: string;
  /** Presente na edição; ausente na criação (define o modo do campo senha). */
  readonly initial?: UserFormValues;
}

const selectClassName = nativeSelectClass;

const ROLE_OPTIONS: { value: UserFormValues["role"]; label: string; hint: string }[] = [
  {
    value: "ADMIN",
    label: "Administrador",
    hint: "acesso total, incluindo usuários e configurações",
  },
  {
    value: "EDITOR",
    label: "Editor",
    hint: "gerencia catálogo e cotações, sem usuários/configurações",
  },
];

export function UserForm({ action, submitLabel, initial }: UserFormProps): React.ReactElement {
  const [state, formAction, pending] = useActionState(action, null);

  const failure = state && state.success === false ? state : null;
  const fieldError = (name: string): string | undefined => failure?.fieldErrors?.[name]?.[0];

  const isEditing = initial !== undefined;

  return (
    <form action={formAction} className="space-y-6">
      {failure?.error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {failure.error}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" defaultValue={initial?.name} required />
        {fieldError("name") && <p className="text-destructive text-sm">{fieldError("name")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" defaultValue={initial?.email} required />
        {fieldError("email") && <p className="text-destructive text-sm">{fieldError("email")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Papel</Label>
        <select
          id="role"
          name="role"
          defaultValue={initial?.role ?? "EDITOR"}
          className={selectClassName}
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} — {option.hint}
            </option>
          ))}
        </select>
        {fieldError("role") && <p className="text-destructive text-sm">{fieldError("role")}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder={isEditing ? "Deixe em branco para manter a atual" : undefined}
          required={!isEditing}
        />
        {fieldError("password") && (
          <p className="text-destructive text-sm">{fieldError("password")}</p>
        )}
        {!isEditing && <p className="text-muted-foreground text-xs">Mínimo de 8 caracteres.</p>}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        Ativo (pode acessar o painel)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.admin.users}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
