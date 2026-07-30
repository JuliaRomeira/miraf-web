"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActionResult } from "@/types";
import {
  createSubcategoryAction,
  deleteSubcategoryAction,
  updateSubcategoryAction,
} from "../actions/category-actions";

export interface SubcategoryItem {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
  readonly productCount: number;
}

interface SubcategoryManagerProps {
  readonly parentId: string;
  readonly subcategories: readonly SubcategoryItem[];
}

/**
 * Gerenciador de subcategorias EMBUTIDO no cadastro da categoria principal
 * (sem tela própria no menu). Permite visualizar, criar, editar e excluir as
 * subcategorias vinculadas àquela categoria. Cada ação chama um Server Action
 * (que revalida) e, ao concluir, `router.refresh()` recarrega a lista.
 */
export function SubcategoryManager({
  parentId,
  subcategories,
}: SubcategoryManagerProps): React.ReactElement {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  /** Executa um action, trata erro e recarrega os dados no sucesso. */
  const run = (action: () => Promise<ActionResult<void>>, onSuccess?: () => void): void => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess?.();
      router.refresh();
    });
  };

  const handleAdd = (): void => {
    if (newName.trim().length < 2) {
      setError("Informe ao menos 2 caracteres.");
      return;
    }
    run(
      () => createSubcategoryAction(parentId, newName),
      () => setNewName(""),
    );
  };

  const startEdit = (item: SubcategoryItem): void => {
    setConfirmingId(null);
    setEditingId(item.id);
    setEditName(item.name);
    setEditActive(item.active);
    setError(null);
  };

  const saveEdit = (id: string): void => {
    if (editName.trim().length < 2) {
      setError("Informe ao menos 2 caracteres.");
      return;
    }
    run(
      () => updateSubcategoryAction(id, { name: editName, active: editActive }),
      () => setEditingId(null),
    );
  };

  const handleDelete = (id: string): void => {
    run(
      () => deleteSubcategoryAction(id),
      () => setConfirmingId(null),
    );
  };

  return (
    <section className="border-border space-y-4 rounded-lg border p-5">
      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Subcategorias</h2>
        <p className="text-muted-foreground text-sm">
          Adicione, edite ou remova as subcategorias desta categoria. Elas aparecem automaticamente
          nos filtros do catálogo.
        </p>
      </div>

      {error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {error}
        </p>
      )}

      {/* Adicionar */}
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Nome da subcategoria"
          aria-label="Nome da nova subcategoria"
          disabled={pending}
        />
        <Button type="button" onClick={handleAdd} disabled={pending}>
          <Plus className="size-4" />
          Adicionar
        </Button>
      </div>

      {/* Lista */}
      {subcategories.length === 0 ? (
        <p className="text-muted-foreground border-border rounded-md border border-dashed px-3 py-4 text-center text-sm">
          Nenhuma subcategoria ainda.
        </p>
      ) : (
        <ul className="divide-border divide-y">
          {subcategories.map((item) => (
            <li key={item.id} className="py-2">
              {editingId === item.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        saveEdit(item.id);
                      } else if (event.key === "Escape") {
                        setEditingId(null);
                      }
                    }}
                    aria-label="Nome da subcategoria"
                    className="max-w-xs"
                    disabled={pending}
                    autoFocus
                  />
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(event) => setEditActive(event.target.checked)}
                      className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      disabled={pending}
                    />
                    Ativa
                  </label>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Salvar"
                    onClick={() => saveEdit(item.id)}
                    disabled={pending}
                  >
                    <Check className="size-4 text-green-600" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Cancelar edição"
                    onClick={() => setEditingId(null)}
                    disabled={pending}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : confirmingId === item.id ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm">
                    Excluir <strong>{item.name}</strong>?
                    {item.productCount > 0 && (
                      <span className="text-muted-foreground">
                        {" "}
                        {item.productCount} produto(s) ficarão só na categoria principal.
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
                      disabled={pending}
                    >
                      {pending ? "Excluindo..." : "Confirmar"}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmingId(null)}
                      disabled={pending}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-medium">{item.name}</span>
                    {!item.active && (
                      <span className="text-muted-foreground ml-2 text-xs">(inativa)</span>
                    )}
                    <span className="text-muted-foreground ml-2 text-xs">
                      {item.productCount} produto{item.productCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Editar ${item.name}`}
                      onClick={() => startEdit(item)}
                      disabled={pending}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Excluir ${item.name}`}
                      onClick={() => {
                        setEditingId(null);
                        setConfirmingId(item.id);
                        setError(null);
                      }}
                      disabled={pending}
                    >
                      <Trash2 className="text-destructive size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
