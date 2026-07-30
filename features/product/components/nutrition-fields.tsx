"use client";

import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { NutrientKind } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NUTRIENT_DEFINITIONS } from "@/features/nutrition/constants/nutrition";

/** Uma linha editável de nutriente (valores como texto, para o input). */
export interface NutritionRowValue {
  readonly kind: NutrientKind;
  readonly label: string;
  readonly unit: string;
  readonly per100: string;
  readonly perServing: string;
  readonly vd: string;
}

/** Dados da tabela nutricional em edição (sem o toggle, que é do dono). */
export interface NutritionData {
  readonly servingsPerPackage: string;
  readonly servingAmount: string;
  readonly servingHousehold: string;
  readonly referenceAmount: string;
  readonly rows: readonly NutritionRowValue[];
}

type MandatoryKind = keyof typeof NUTRIENT_DEFINITIONS;

/** Nutrientes obrigatórios, na ordem oficial. */
const MANDATORY = (Object.keys(NUTRIENT_DEFINITIONS) as MandatoryKind[])
  .map((kind) => ({ kind, ...NUTRIENT_DEFINITIONS[kind] }))
  .sort((a, b) => a.order - b.order);

/** Linha vazia de um nutriente obrigatório (rótulo/unidade canônicos). */
function mandatoryRow(kind: MandatoryKind): NutritionRowValue {
  const def = NUTRIENT_DEFINITIONS[kind];
  return { kind, label: def.label, unit: def.unit, per100: "", perServing: "", vd: "" };
}

/** Tabela nutricional vazia: os 10 obrigatórios em branco (ponto de partida). */
export function emptyNutritionData(): NutritionData {
  return {
    servingsPerPackage: "",
    servingAmount: "",
    servingHousehold: "",
    referenceAmount: "100 g",
    rows: MANDATORY.map((def) => mandatoryRow(def.kind)),
  };
}

/** "0,5" ou "0.5" → 0.5; vazio/inválido → null. */
function toNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (normalized === "") return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function toInteger(value: string): number | null {
  const normalized = value.trim();
  if (normalized === "") return null;
  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Payload JSON (formato do `nutritionSchema` do Zod) a partir dos dados editados. */
export function serializeNutritionData(data: NutritionData): unknown {
  return {
    servingsPerPackage: data.servingsPerPackage.trim() || undefined,
    servingAmount: data.servingAmount.trim(),
    servingHousehold: data.servingHousehold.trim() || undefined,
    referenceAmount: data.referenceAmount.trim() || "100 g",
    rows: data.rows.map((row) => ({
      kind: row.kind,
      label: row.label.trim() || undefined,
      unit: row.unit.trim() || undefined,
      valuePer100: toNumber(row.per100),
      valuePerServing: toNumber(row.perServing),
      dailyValuePercent: toInteger(row.vd),
    })),
  };
}

interface NutritionFieldsProps {
  readonly value: NutritionData;
  readonly onChange: (next: NutritionData) => void;
  /** Prefixo para ids únicos (evita colisão entre múltiplas instâncias/sabores). */
  readonly idPrefix: string;
}

/**
 * Editor da tabela nutricional (porção + linhas de nutriente). Controlado: o
 * dono guarda o `value` e recebe as mudanças via `onChange`. O toggle "tem
 * tabela?" fica no componente pai. Reutilizado no nível do produto e por sabor.
 * Enter percorre os campos na ordem visual (sem enviar o formulário).
 */
export function NutritionFields({
  value,
  onChange,
  idPrefix,
}: NutritionFieldsProps): React.ReactElement {
  const fieldsRef = useRef<HTMLDivElement>(null);

  const patch = (fields: Partial<NutritionData>): void => onChange({ ...value, ...fields });

  const updateRow = (index: number, rowPatch: Partial<NutritionRowValue>): void => {
    onChange({
      ...value,
      rows: value.rows.map((row, i) => (i === index ? { ...row, ...rowPatch } : row)),
    });
  };

  const addNutrient = (): void => {
    onChange({
      ...value,
      rows: [
        ...value.rows,
        { kind: "OTHER", label: "", unit: "", per100: "", perServing: "", vd: "" },
      ],
    });
  };

  const removeRow = (index: number): void => {
    onChange({ ...value, rows: value.rows.filter((_, i) => i !== index) });
  };

  /**
   * Enter percorre os campos da tabela na ordem visual (como Tab) em vez de
   * enviar o formulário — evita o "pulo" para um campo/ação sem relação.
   */
  const handleFieldsKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName !== "INPUT") return;
    event.preventDefault();
    const root = fieldsRef.current;
    if (!root) return;
    const inputs = Array.from(root.querySelectorAll<HTMLInputElement>("input"));
    const next = inputs[inputs.indexOf(target as HTMLInputElement) + 1];
    if (next) {
      next.focus();
      next.select();
    }
  };

  return (
    <div
      ref={fieldsRef}
      onKeyDown={handleFieldsKeyDown}
      className="border-border space-y-5 rounded-lg border p-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-serving`}>
            Porção <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-serving`}
            value={value.servingAmount}
            onChange={(event) => patch({ servingAmount: event.target.value })}
            placeholder="Ex.: 50 g"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-household`}>Medida caseira</Label>
          <Input
            id={`${idPrefix}-household`}
            value={value.servingHousehold}
            onChange={(event) => patch({ servingHousehold: event.target.value })}
            placeholder="Ex.: 1/2 xícara de chá"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-servings`}>Porções por embalagem</Label>
          <Input
            id={`${idPrefix}-servings`}
            value={value.servingsPerPackage}
            onChange={(event) => patch({ servingsPerPackage: event.target.value })}
            placeholder="Ex.: 500"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-reference`}>Coluna de referência</Label>
          <Input
            id={`${idPrefix}-reference`}
            value={value.referenceAmount}
            onChange={(event) => patch({ referenceAmount: event.target.value })}
            placeholder="100 g"
          />
        </div>
      </div>

      <div className="space-y-2 overflow-x-auto pb-1">
        <div className="text-muted-foreground grid min-w-[34rem] grid-cols-[1fr_5rem_5rem_5rem_2rem] items-center gap-2 px-1 text-xs font-medium">
          <span>Nutriente</span>
          <span className="text-center">{value.referenceAmount || "100 g"}</span>
          <span className="text-center">{value.servingAmount || "Porção"}</span>
          <span className="text-center">%VD</span>
          <span />
        </div>

        {value.rows.map((row, index) => {
          const isOther = row.kind === "OTHER";
          return (
            <div
              key={isOther ? `other-${index}` : row.kind}
              className="grid min-w-[34rem] grid-cols-[1fr_5rem_5rem_5rem_2rem] items-center gap-2"
            >
              <div className="flex gap-1">
                <Input
                  aria-label="Nome do nutriente"
                  value={row.label}
                  onChange={(event) => updateRow(index, { label: event.target.value })}
                  placeholder="Nome do nutriente"
                  className="h-9"
                />
                <Input
                  aria-label="Unidade"
                  value={row.unit}
                  onChange={(event) => updateRow(index, { unit: event.target.value })}
                  placeholder="un."
                  className="h-9 w-16"
                />
              </div>

              <Input
                type="number"
                step="any"
                min={0}
                aria-label={`${row.label} por ${value.referenceAmount || "100 g"}`}
                value={row.per100}
                onChange={(event) => updateRow(index, { per100: event.target.value })}
                className="h-9 text-center"
              />
              <Input
                type="number"
                step="any"
                min={0}
                aria-label={`${row.label} por porção`}
                value={row.perServing}
                onChange={(event) => updateRow(index, { perServing: event.target.value })}
                className="h-9 text-center"
              />
              <Input
                type="number"
                step={1}
                min={0}
                aria-label={`${row.label} %VD`}
                value={row.vd}
                onChange={(event) => updateRow(index, { vd: event.target.value })}
                className="h-9 text-center"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remover ${row.label || "nutriente"}`}
                className="text-muted-foreground hover:text-destructive size-9"
                onClick={() => removeRow(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          );
        })}

        {value.rows.length === 0 && (
          <p className="text-muted-foreground py-2 text-sm">
            Nenhum nutriente. Adicione ao menos um abaixo.
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addNutrient}
        className="w-full sm:w-auto"
      >
        <Plus className="size-4" />
        Adicionar nutriente
      </Button>

      <p className="text-muted-foreground text-xs">
        Deixe em branco os campos que não se aplicam. Linhas sem nenhum valor não são exibidas. Use
        &ldquo;Adicionar nutriente&rdquo; para incluir vitaminas/minerais ou um item removido.
      </p>
    </div>
  );
}
