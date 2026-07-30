"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { ImageUpload, type UploadedImage } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { SingleDocumentUpload } from "@/components/shared/single-document-upload";
import { FormTabs, type FormTab } from "@/components/shared/form-tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { nativeSelectClass } from "@/components/ui/native-select";
import {
  FlavorFormSection,
  type FlavorFormValue,
} from "@/features/product/components/flavor-form-section";
import {
  NutritionFormSection,
  type NutritionFormValue,
} from "@/features/product/components/nutrition-form-section";
import { RelatedProductsField } from "@/features/product/components/related-products-field";
import { ROUTES } from "@/constants";
import type { ActionResult } from "@/types";

interface Option {
  readonly id: string;
  readonly name: string;
}

/** Categoria principal com suas subcategorias (para o select dependente). */
interface CategoryTreeItem extends Option {
  readonly children: readonly Option[];
}

export interface ProductFormValues {
  readonly name: string;
  readonly description: string;
  readonly shortDescription: string;
  readonly composition: string;
  readonly application: string;
  readonly conservation: string;
  readonly preparation: string;
  readonly technicalSheetUrl: string;
  readonly highlights: readonly string[];
  readonly weight: string;
  readonly sku: string;
  readonly packaging: string;
  readonly saleUnit: string;
  readonly status: "DRAFT" | "ACTIVE" | "INACTIVE";
  readonly featured: boolean;
  readonly order: number;
  readonly categoryId: string;
  readonly subcategoryId: string;
  readonly supplierId: string;
  readonly images: readonly UploadedImage[];
  readonly flavors: readonly FlavorFormValue[];
  readonly nutrition: NutritionFormValue | null;
  readonly relatedProductIds: readonly string[];
}

interface ProductFormProps {
  readonly action: (
    prev: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  readonly categories: readonly CategoryTreeItem[];
  readonly supplierOptions: readonly Option[];
  /** Produtos para o seletor de relacionados (todos, menos o próprio na edição). */
  readonly productOptions: readonly Option[];
  readonly submitLabel: string;
  readonly initial?: ProductFormValues;
}

const selectClassName = nativeSelectClass;

const STATUS_OPTIONS: { value: ProductFormValues["status"]; label: string }[] = [
  { value: "DRAFT", label: "Rascunho" },
  { value: "ACTIVE", label: "Ativo (visível no catálogo)" },
  { value: "INACTIVE", label: "Inativo" },
];

/** Campos que pertencem a cada aba — para marcar a aba com erro após submit. */
const TAB_FIELDS: Record<string, readonly string[]> = {
  geral: ["name", "shortDescription", "description", "images"],
  especificacoes: [
    "categoryId",
    "subcategoryId",
    "supplierId",
    "sku",
    "packaging",
    "weight",
    "saleUnit",
    "status",
    "order",
    "relatedProductIds",
  ],
  conteudo: ["composition", "application", "conservation", "preparation", "technicalSheetUrl"],
  variacoes: ["flavors"],
  nutricao: ["nutrition"],
};

/** Título de seção reutilizável dentro das abas. */
function SectionTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return <h3 className="text-sm font-semibold tracking-wide uppercase">{children}</h3>;
}

export function ProductForm({
  action,
  categories,
  supplierOptions,
  productOptions,
  submitLabel,
  initial,
}: ProductFormProps): React.ReactElement {
  const [state, formAction, pending] = useActionState(action, null);
  // Com variações, a tabela nutricional é por variação; sem elas, é do produto.
  const [flavorCount, setFlavorCount] = useState(initial?.flavors?.length ?? 0);

  // Categoria e subcategoria: a segunda depende da primeira.
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [subcategoryId, setSubcategoryId] = useState(initial?.subcategoryId ?? "");
  const subcategoryOptions = categories.find((cat) => cat.id === categoryId)?.children ?? [];

  const handleCategoryChange = (value: string): void => {
    setCategoryId(value);
    const stillValid = categories
      .find((cat) => cat.id === value)
      ?.children.some((sub) => sub.id === subcategoryId);
    if (!stillValid) {
      setSubcategoryId("");
    }
  };

  const failure = state && state.success === false ? state : null;
  const fieldError = (name: string): string | undefined => failure?.fieldErrors?.[name]?.[0];
  const tabHasError = (tabId: string): boolean =>
    failure?.fieldErrors
      ? TAB_FIELDS[tabId]?.some((field) => failure.fieldErrors?.[field]) === true
      : false;

  const tabs: FormTab[] = [
    {
      id: "geral",
      label: "Geral",
      hasError: tabHasError("geral"),
      content: (
        <div className="space-y-6">
          <section className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input id="name" name="name" defaultValue={initial?.name} required />
              {fieldError("name") && (
                <p className="text-destructive text-sm">{fieldError("name")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descrição resumida</Label>
              <Textarea
                id="shortDescription"
                name="shortDescription"
                defaultValue={initial?.shortDescription}
                rows={2}
                placeholder="Resumo curto exibido no topo da página do produto (1–2 linhas)."
              />
              {fieldError("shortDescription") && (
                <p className="text-destructive text-sm">{fieldError("shortDescription")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descrição completa <span className="text-destructive">*</span>
              </Label>
              <RichTextEditor
                name="description"
                defaultValue={initial?.description}
                placeholder="Descreva o produto. Use a barra de ferramentas para títulos, listas, negrito, cores…"
              />
              <p className="text-muted-foreground text-xs">
                Formate o texto (títulos, listas, negrito, cor, links) para destacar as informações
                importantes.
              </p>
              {fieldError("description") && (
                <p className="text-destructive text-sm">{fieldError("description")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="highlights">Destaques / benefícios</Label>
              <Textarea
                id="highlights"
                name="highlights"
                defaultValue={initial?.highlights?.join("\n")}
                rows={3}
                placeholder={
                  "Um destaque por linha, ex.:\nAlta qualidade e rendimento\nPraticidade no preparo"
                }
              />
              <p className="text-muted-foreground text-xs">
                Um por linha. Aparecem como lista de benefícios (com ✓) na página do produto.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <SectionTitle>Imagens</SectionTitle>
            <p className="text-muted-foreground text-sm">
              Selecione uma ou mais imagens do computador. O upload é automático; marque uma como
              capa.
            </p>
            <ImageUpload name="images" folder="products" initial={initial?.images} />
          </section>
        </div>
      ),
    },
    {
      id: "especificacoes",
      label: "Especificações",
      hasError: tabHasError("especificacoes"),
      content: (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">
                Categoria <span className="text-destructive">*</span>
              </Label>
              <select
                id="categoryId"
                name="categoryId"
                value={categoryId}
                onChange={(event) => handleCategoryChange(event.target.value)}
                className={selectClassName}
                required
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {categories.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              {fieldError("categoryId") && (
                <p className="text-destructive text-sm">{fieldError("categoryId")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategoryId">Subcategoria</Label>
              <select
                id="subcategoryId"
                name="subcategoryId"
                value={subcategoryId}
                onChange={(event) => setSubcategoryId(event.target.value)}
                className={selectClassName}
                disabled={subcategoryOptions.length === 0}
              >
                <option value="">
                  {subcategoryOptions.length === 0
                    ? "— Sem subcategorias —"
                    : "— Nenhuma (opcional) —"}
                </option>
                {subcategoryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="text-muted-foreground text-xs">
                Carrega as subcategorias da categoria escolhida. Pode ficar vazio.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplierId">Fornecedor</Label>
              <select
                id="supplierId"
                name="supplierId"
                defaultValue={initial?.supplierId ?? ""}
                className={selectClassName}
              >
                <option value="">— Nenhum —</option>
                {supplierOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={initial?.status ?? "DRAFT"}
                className={selectClassName}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Código (SKU)</Label>
              <Input id="sku" name="sku" defaultValue={initial?.sku} placeholder="Código interno" />
              {fieldError("sku") && <p className="text-destructive text-sm">{fieldError("sku")}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="packaging">Embalagem</Label>
              <Input
                id="packaging"
                name="packaging"
                defaultValue={initial?.packaging}
                placeholder="Ex.: Caixa com 12 unidades de 1kg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                name="weight"
                defaultValue={initial?.weight}
                placeholder="Ex.: 5 kg, 500 g"
              />
              {fieldError("weight") && (
                <p className="text-destructive text-sm">{fieldError("weight")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="saleUnit">
                Unidade de venda <span className="text-destructive">*</span>
              </Label>
              <Input
                id="saleUnit"
                name="saleUnit"
                list="sale-unit-options"
                defaultValue={initial?.saleUnit ?? "unidade"}
                placeholder="Ex.: caixa, unidade, fardo"
              />
              <datalist id="sale-unit-options">
                <option value="unidade" />
                <option value="caixa" />
                <option value="fardo" />
                <option value="pacote" />
                <option value="saco" />
                <option value="kg" />
              </datalist>
              <p className="text-muted-foreground text-xs">
                Aparece na cotação junto da quantidade (ex.: “3 caixas”).
              </p>
              {fieldError("saleUnit") && (
                <p className="text-destructive text-sm">{fieldError("saleUnit")}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Ordem de exibição</Label>
              <Input
                id="order"
                name="order"
                type="number"
                min={0}
                defaultValue={initial?.order ?? 0}
              />
              {fieldError("order") && (
                <p className="text-destructive text-sm">{fieldError("order")}</p>
              )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={initial?.featured ?? false}
              className="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            />
            Produto em destaque
          </label>

          <section className="border-border space-y-3 border-t pt-6">
            <SectionTitle>Produtos relacionados</SectionTitle>
            <p className="text-muted-foreground text-sm">
              Selecione produtos para sugerir junto deste (opcional).
            </p>
            <RelatedProductsField
              name="relatedProductIds"
              options={productOptions}
              initial={initial?.relatedProductIds}
            />
          </section>
        </div>
      ),
    },
    {
      id: "conteudo",
      label: "Conteúdo",
      hasError: tabHasError("conteudo"),
      content: (
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Campos opcionais. Cada bloco preenchido vira uma seção organizada na página do produto —
            os vazios não aparecem.
          </p>

          <div className="space-y-2">
            <Label>Composição / ingredientes</Label>
            <RichTextEditor
              name="composition"
              defaultValue={initial?.composition}
              placeholder="Ingredientes, informações de alérgenos…"
            />
          </div>

          <div className="space-y-2">
            <Label>Modo de aplicação / uso</Label>
            <RichTextEditor
              name="application"
              defaultValue={initial?.application}
              placeholder="Como e onde utilizar o produto…"
            />
          </div>

          <div className="space-y-2">
            <Label>Conservação / armazenamento</Label>
            <RichTextEditor
              name="conservation"
              defaultValue={initial?.conservation}
              placeholder="Como conservar antes e depois de aberto…"
            />
          </div>

          <div className="space-y-2">
            <Label>Modo de preparo</Label>
            <RichTextEditor
              name="preparation"
              defaultValue={initial?.preparation}
              placeholder="Passo a passo de preparo/uso do produto…"
            />
          </div>

          <section className="border-border space-y-3 border-t pt-6">
            <SectionTitle>Ficha técnica</SectionTitle>
            <p className="text-muted-foreground text-sm">
              Documento (PDF ou imagem) exibido na página do produto. Opcional.
            </p>
            <SingleDocumentUpload
              name="technicalSheetUrl"
              initialUrl={initial?.technicalSheetUrl}
            />
          </section>
        </div>
      ),
    },
    {
      id: "variacoes",
      label: "Variações",
      hasError: tabHasError("variacoes"),
      content: (
        <FlavorFormSection
          name="flavors"
          initial={initial?.flavors}
          onCountChange={setFlavorCount}
        />
      ),
    },
    {
      id: "nutricao",
      label: "Nutrição",
      hasError: tabHasError("nutricao"),
      content: (
        <NutritionFormSection
          name="nutrition"
          initial={initial?.nutrition}
          hasFlavors={flavorCount > 0}
        />
      ),
    },
  ];

  return (
    <form action={formAction} className="space-y-8">
      {failure?.error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {failure.error}
        </p>
      )}

      <FormTabs tabs={tabs} />

      <div className="flex items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : submitLabel}
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.admin.products}>Cancelar</Link>
        </Button>
      </div>
    </form>
  );
}
