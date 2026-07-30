"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ChevronDown, Copy, ImagePlus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload, type UploadedImage } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SingleDocumentUpload } from "@/components/shared/single-document-upload";
import { cn } from "@/lib/utils";
import {
  NutritionFields,
  emptyNutritionData,
  serializeNutritionData,
  type NutritionData,
} from "@/features/product/components/nutrition-fields";

/** Valor inicial de uma variação (cadastro completo, com galeria própria). */
export interface FlavorFormValue {
  readonly name: string;
  readonly images: readonly UploadedImage[];
  readonly sku: string;
  readonly weight: string;
  readonly description: string;
  readonly technicalSheetUrl: string;
  readonly available: boolean;
  readonly nutrition: NutritionData | null;
}

/** Estado interno de uma variação em edição (inclui UI: aberto/toggle). */
interface FlavorState {
  readonly name: string;
  readonly images: UploadedImage[];
  readonly sku: string;
  readonly weight: string;
  readonly description: string;
  readonly technicalSheetUrl: string;
  readonly available: boolean;
  /** Toggle "esta variação tem tabela". */
  readonly nutritionEnabled: boolean;
  /** Dados da tabela (preservados em memória mesmo com o toggle desligado). */
  readonly nutrition: NutritionData;
  /** UI: cartão expandido para edição (não serializado). */
  readonly open: boolean;
}

function toState(flavor: FlavorFormValue, open: boolean): FlavorState {
  return {
    name: flavor.name,
    images: [...flavor.images],
    sku: flavor.sku,
    weight: flavor.weight,
    description: flavor.description,
    technicalSheetUrl: flavor.technicalSheetUrl,
    available: flavor.available,
    nutritionEnabled: flavor.nutrition !== null,
    nutrition: flavor.nutrition ?? emptyNutritionData(),
    open,
  };
}

function emptyFlavor(): FlavorState {
  return {
    name: "",
    images: [],
    sku: "",
    weight: "",
    description: "",
    technicalSheetUrl: "",
    available: true,
    nutritionEnabled: false,
    nutrition: emptyNutritionData(),
    open: true,
  };
}

/** Miniatura de capa da variação (para o cabeçalho do cartão). */
function coverOf(images: readonly UploadedImage[]): string | null {
  return (images.find((image) => image.isPrimary) ?? images[0])?.url ?? null;
}

interface FlavorFormSectionProps {
  readonly name: string;
  readonly initial?: readonly FlavorFormValue[];
  /** Notifica o pai sobre a quantidade de variações (esconde a tabela do produto). */
  readonly onCountChange?: (count: number) => void;
}

/**
 * Seção "Variações" do formulário de produto. Cada variação é um cadastro
 * completo (nome, **galeria própria de imagens**, SKU, peso, descrição, ficha
 * técnica, disponibilidade e tabela nutricional) num cartão expansível. Vazio =
 * produto sem variações (aí a galeria/tabela são do produto). Serializa em JSON
 * num hidden input; a Server Action valida com Zod.
 */
export function FlavorFormSection({
  name,
  initial,
  onCountChange,
}: FlavorFormSectionProps): React.ReactElement {
  const [flavors, setFlavors] = useState<FlavorState[]>(() =>
    initial && initial.length > 0 ? initial.map((flavor) => toState(flavor, false)) : [],
  );

  useEffect(() => {
    onCountChange?.(flavors.length);
  }, [flavors.length, onCountChange]);

  const serialized = useMemo(
    () =>
      JSON.stringify(
        flavors
          .filter((flavor) => flavor.name.trim() !== "")
          .map((flavor) => ({
            name: flavor.name.trim(),
            images: flavor.images,
            sku: flavor.sku.trim() || undefined,
            weight: flavor.weight.trim() || undefined,
            description: flavor.description.trim() || undefined,
            technicalSheetUrl: flavor.technicalSheetUrl || undefined,
            available: flavor.available,
            nutrition: flavor.nutritionEnabled ? serializeNutritionData(flavor.nutrition) : null,
          })),
      ),
    [flavors],
  );

  const updateFlavor = (index: number, patch: Partial<FlavorState>): void => {
    setFlavors((current) =>
      current.map((flavor, i) => (i === index ? { ...flavor, ...patch } : flavor)),
    );
  };

  const addFlavor = (): void => {
    setFlavors((current) => [...current, emptyFlavor()]);
  };

  const removeFlavor = (index: number): void => {
    setFlavors((current) => current.filter((_, i) => i !== index));
  };

  /** Reordena a variação (a ordem no array define a ordem exibida/salva). */
  const moveFlavor = (index: number, direction: -1 | 1): void => {
    setFlavors((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      const moved = next[index]!;
      next[index] = next[target]!;
      next[target] = moved;
      return next;
    });
  };

  /** Copia a tabela da variação anterior (evita redigitar quando são parecidas). */
  const copyFromPrevious = (index: number): void => {
    setFlavors((current) => {
      const previous = current[index - 1];
      if (!previous) return current;
      return current.map((flavor, i) =>
        i === index ? { ...flavor, nutritionEnabled: true, nutrition: previous.nutrition } : flavor,
      );
    });
  };

  return (
    <section className="space-y-4">
      <input type="hidden" name={name} value={serialized} />

      <div className="space-y-1">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Variações</h2>
        <p className="text-muted-foreground text-sm">
          Para produtos com mais de uma versão (ex.: sabores). Cada variação tem cadastro próprio —
          galeria de imagens (frente, verso, embalagem…), código, peso, descrição, ficha técnica e
          tabela nutricional. Use as setas ↑ ↓ para definir a ordem de exibição. O cliente escolhe a
          variação ao montar a cotação. Deixe vazio se o produto não tem variações.
        </p>
      </div>

      {flavors.length > 0 && (
        <ul className="space-y-3">
          {flavors.map((flavor, index) => {
            const cover = coverOf(flavor.images);
            return (
              <li key={index} className="border-border overflow-hidden rounded-xl border">
                {/* Cabeçalho do cartão: miniatura + nome + status + expandir/remover */}
                <div className="bg-muted/30 flex items-center gap-3 px-3 py-2.5">
                  <div className="bg-background relative size-10 shrink-0 overflow-hidden rounded border">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    ) : (
                      <div className="text-muted-foreground/40 flex h-full items-center justify-center">
                        <ImagePlus className="size-4" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => updateFlavor(index, { open: !flavor.open })}
                    aria-expanded={flavor.open}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="truncate text-sm font-medium">
                      {flavor.name.trim() || `Variação ${index + 1}`}
                    </span>
                    {flavor.images.length > 0 && (
                      <span className="text-muted-foreground hidden text-xs sm:inline">
                        {flavor.images.length} img
                      </span>
                    )}
                    {!flavor.available && (
                      <span className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-[11px] font-medium">
                        Indisponível
                      </span>
                    )}
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground ml-auto size-4 shrink-0 transition-transform",
                        flavor.open && "rotate-180",
                      )}
                    />
                  </button>
                  <div className="flex shrink-0 items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Mover variação ${index + 1} para cima`}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground size-8 disabled:opacity-30"
                      onClick={() => moveFlavor(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Mover variação ${index + 1} para baixo`}
                      disabled={index === flavors.length - 1}
                      className="text-muted-foreground hover:text-foreground size-8 disabled:opacity-30"
                      onClick={() => moveFlavor(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover variação ${index + 1}`}
                      className="text-muted-foreground hover:text-destructive size-8"
                      onClick={() => removeFlavor(index)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>

                {flavor.open && (
                  <div className="space-y-5 p-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor={`flavor-${index}-name`}>
                          Nome <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`flavor-${index}-name`}
                          value={flavor.name}
                          onChange={(event) => updateFlavor(index, { name: event.target.value })}
                          placeholder="Ex.: Chocolate"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`flavor-${index}-sku`}>Código (SKU)</Label>
                        <Input
                          id={`flavor-${index}-sku`}
                          value={flavor.sku}
                          onChange={(event) => updateFlavor(index, { sku: event.target.value })}
                          placeholder="Código da variação"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`flavor-${index}-weight`}>Peso</Label>
                        <Input
                          id={`flavor-${index}-weight`}
                          value={flavor.weight}
                          onChange={(event) => updateFlavor(index, { weight: event.target.value })}
                          placeholder="Ex.: 40 g"
                        />
                      </div>
                      <label className="flex items-center gap-2 self-end pb-2 text-sm font-medium">
                        <input
                          type="checkbox"
                          checked={flavor.available}
                          onChange={(event) =>
                            updateFlavor(index, { available: event.target.checked })
                          }
                          className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                        />
                        Disponível para cotação
                      </label>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Galeria de imagens da variação</Label>
                      <p className="text-muted-foreground text-xs">
                        Frente, verso, embalagem, detalhe… A capa é a imagem exibida ao selecionar a
                        variação.
                      </p>
                      <ImageUpload
                        folder="flavors"
                        value={flavor.images}
                        onChange={(images) => updateFlavor(index, { images })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Descrição da variação</Label>
                      <RichTextEditor
                        value={flavor.description}
                        onChange={(html) => updateFlavor(index, { description: html })}
                        placeholder="Opcional. Substitui a descrição do produto quando preenchida."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Ficha técnica da variação</Label>
                      <SingleDocumentUpload
                        value={flavor.technicalSheetUrl}
                        onChange={(path) => updateFlavor(index, { technicalSheetUrl: path })}
                        label="Selecionar ficha técnica"
                      />
                    </div>

                    <div className="border-border/60 space-y-4 border-t pt-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={flavor.nutritionEnabled}
                            onChange={(event) =>
                              updateFlavor(index, { nutritionEnabled: event.target.checked })
                            }
                            className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                          />
                          Esta variação tem tabela nutricional
                        </label>
                        {flavor.nutritionEnabled && index > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyFromPrevious(index)}
                          >
                            <Copy className="size-4" />
                            Copiar da anterior
                          </Button>
                        )}
                      </div>

                      {flavor.nutritionEnabled && (
                        <NutritionFields
                          value={flavor.nutrition}
                          onChange={(next) => updateFlavor(index, { nutrition: next })}
                          idPrefix={`flavor-${index}-nutrition`}
                        />
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addFlavor}>
        <Plus className="size-4" />
        Adicionar variação
      </Button>
    </section>
  );
}
