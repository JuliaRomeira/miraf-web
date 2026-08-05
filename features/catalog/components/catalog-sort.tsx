"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { nativeSelectClass } from "@/components/ui/native-select";

const SORT_OPTIONS = [
  { value: "relevancia", label: "Mais relevantes" },
  { value: "nome", label: "Nome (A–Z)" },
  { value: "recentes", label: "Mais recentes" },
] as const;

/**
 * Seletor "Ordenar por" da barra de resultados do catálogo. Atualiza `?ordenar=`
 * na URL (client-side, sem reload); o service traduz para o `orderBy` do Prisma.
 */
export function CatalogSort(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const current = searchParams.get("ordenar") ?? "relevancia";

  const onChange = (value: string): void => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "relevancia") {
      params.set("ordenar", value);
    } else {
      params.delete("ordenar");
    }
    params.delete("pagina");
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };

  return (
    <label className="text-muted-foreground flex items-center gap-2 text-sm">
      <span className="hidden sm:inline">Ordenar por</span>
      <select
        value={current}
        onChange={(event) => onChange(event.target.value)}
        disabled={pending}
        aria-label="Ordenar produtos por"
        className={cn(
          nativeSelectClass,
          "hover:border-primary/40 w-auto cursor-pointer font-medium",
        )}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
