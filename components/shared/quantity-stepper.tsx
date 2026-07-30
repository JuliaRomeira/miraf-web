"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  readonly value: number;
  readonly onChange: (next: number) => void;
  /** Rótulo acessível do grupo/campo (ex.: "Quantidade de Farinha"). */
  readonly label: string;
  /**
   * Quando fornecido, o botão de diminuir em `min` vira "remover" (chama
   * `onRemove`) em vez de ficar desabilitado. Sem ele, o botão desabilita no
   * mínimo.
   */
  readonly onRemove?: () => void;
  readonly min?: number;
  readonly max?: number;
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

/**
 * Stepper de quantidade controlado e minimalista `[−] n [+]`. Puro (não conhece
 * o carrinho): o consumidor liga o `value`/`onChange` ao estado que quiser. Todo
 * valor emitido já vem clampeado em `[min, max]`; a remoção é explícita via
 * `onRemove` (assim `onChange` nunca precisa lidar com zero).
 */
export function QuantityStepper({
  value,
  onChange,
  label,
  onRemove,
  min = 1,
  max = 9999,
  size = "md",
  className,
}: QuantityStepperProps): React.ReactElement {
  const clamp = (n: number): number => Math.min(max, Math.max(min, Math.floor(n)));
  const atMin = value <= min;
  const btnSize = size === "sm" ? "size-8" : size === "lg" ? "size-12" : "size-9";
  const fieldSize =
    size === "sm" ? "h-8 w-12 text-sm" : size === "lg" ? "h-12 w-16 text-base" : "h-9 w-14 text-sm";
  const iconSize = size === "lg" ? "size-5" : "size-4";
  // No tamanho lg o grupo ganha uma "casca" arredondada, unificando os controles
  // num único bloco (aparência mais encorpada e clicável, alinhada ao CTA).
  const shell = size === "lg" ? "border-input rounded-full border p-1 gap-1 shadow-soft" : "gap-1";
  const btnInteract =
    "hover:border-primary/50 hover:text-primary transition-all duration-150 active:scale-90";

  return (
    <div
      className={cn("bg-background flex items-center", shell, className)}
      role="group"
      aria-label={label}
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(btnSize, btnInteract, size === "lg" && "rounded-full border-0 shadow-none")}
        aria-label={atMin && onRemove ? "Remover da cotação" : "Diminuir quantidade"}
        disabled={atMin && !onRemove}
        onClick={() => (atMin && onRemove ? onRemove() : onChange(clamp(value - 1)))}
      >
        <Minus className={iconSize} />
      </Button>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        aria-label={label}
        onChange={(event) => {
          if (event.target.value === "") return;
          const next = Number(event.target.value);
          if (Number.isFinite(next)) onChange(clamp(next));
        }}
        className={cn(
          "focus-visible:ring-ring [appearance:textfield] rounded-md bg-transparent text-center font-semibold tabular-nums focus-visible:ring-1 focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          size === "lg" ? "border-0" : "border-input border",
          fieldSize,
        )}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(btnSize, btnInteract, size === "lg" && "rounded-full border-0 shadow-none")}
        aria-label="Aumentar quantidade"
        disabled={value >= max}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className={iconSize} />
      </Button>
    </div>
  );
}
