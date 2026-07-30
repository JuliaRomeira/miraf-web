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

interface CategoryFormValues {
  readonly name: string;
  readonly description: string;
  readonly imageUrl: string;
  readonly bannerUrl: string;
  readonly order: number;
  readonly active: boolean;
}

interface CategoryFormProps {
  readonly action: (
    prev: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  readonly submitLabel: string;
  readonly initial?: CategoryFormValues;
}

// (o antigo select de "Categoria pai" saiu — subcategorias são gerenciadas no
// gerenciador embutido da tela de edição; toda categoria do formulário é raiz.)

/**
 * Formulário de criação/edição de uma categoria PRINCIPAL. Reutilizado nas duas
 * telas — a diferença é o Server Action recebido via prop (create ou update
 * vinculado ao id). As subcategorias são gerenciadas à parte, no gerenciador
 * embutido da tela de edição (`SubcategoryManager`).
 */
export function CategoryForm({
  action,
  submitLabel,
  initial,
}: CategoryFormProps): React.ReactElement {
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
        <Input
          id="name"
          name="name"
          defaultValue={initial?.name}
          required
          aria-invalid={!!fieldError("name")}
        />
        {fieldError("name") && <p className="text-destructive text-sm">{fieldError("name")}</p>}
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

      <div className="space-y-2">
        <Label>Imagem</Label>
        <SingleImageUpload name="imageUrl" folder="categories" initialUrl={initial?.imageUrl} />
        <p className="text-muted-foreground text-xs">
          Quadrada (~800×800). Usada nos cards de segmento da home e do catálogo.
        </p>
        {fieldError("imageUrl") && (
          <p className="text-destructive text-sm">{fieldError("imageUrl")}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Banner</Label>
        <SingleImageUpload name="bannerUrl" folder="categories" initialUrl={initial?.bannerUrl} />
        <p className="text-muted-foreground text-xs">
          Opcional. Imagem larga (~1600×500) reservada para o topo da página da categoria.
        </p>
        {fieldError("bannerUrl") && (
          <p className="text-destructive text-sm">{fieldError("bannerUrl")}</p>
        )}
      </div>

      <div className="max-w-xs space-y-2">
        <Label htmlFor="order">Ordem de exibição</Label>
        <Input id="order" name="order" type="number" min={0} defaultValue={initial?.order ?? 0} />
        {fieldError("order") && <p className="text-destructive text-sm">{fieldError("order")}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        />
        Ativa (visível no catálogo)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.admin.categories}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
