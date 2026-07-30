import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes condicionais (clsx) e resolve conflitos de classes
 * do Tailwind (tailwind-merge). Utilizado por todos os componentes de UI.
 *
 * @example
 * cn("px-2 py-1", isActive && "bg-primary", className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
