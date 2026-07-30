"use client";

import { useActionState } from "react";
import Link from "next/link";

import { SingleImageUpload } from "@/components/shared/single-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

export interface SupplierFormValues {
  readonly name: string;
  readonly logoUrl: string;
  readonly description: string;
  readonly order: number;
  readonly active: boolean;
}

interface SupplierFormProps {
  readonly action: (
    prev: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  readonly submitLabel: string;
  readonly initial?: SupplierFormValues;
}

export function SupplierForm({
  action,
  submitLabel,
  initial,
}: SupplierFormProps): React.ReactElement {
  const [state, formAction, pending] = useActionState(action, null);

  const failure = state && state.success === false ? state : null;
  const fieldError = (name: string): string | undefined => failure?.fieldErrors?.[name]?.[0];

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
        <Label>Logo</Label>
        <SingleImageUpload name="logoUrl" folder="suppliers" initialUrl={initial?.logoUrl} />
        {fieldError("logoUrl") && (
          <p className="text-destructive text-sm">{fieldError("logoUrl")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          rows={3}
        />
        {fieldError("description") && (
          <p className="text-destructive text-sm">{fieldError("description")}</p>
        )}
      </div>

      <div className="max-w-xs space-y-2">
        <Label htmlFor="order">Ordem de exibição</Label>
        <Input id="order" name="order" type="number" min={0} defaultValue={initial?.order ?? 0} />
        <p className="text-muted-foreground text-xs">
          Define a posição nas vitrines de fornecedores (menor aparece primeiro).
        </p>
        {fieldError("order") && <p className="text-destructive text-sm">{fieldError("order")}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        Ativo (visível no catálogo)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.admin.suppliers}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
