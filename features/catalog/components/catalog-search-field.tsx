"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Campo de busca do painel de filtros do catálogo. Pesquisa por nome, código
 * (SKU) ou fornecedor (a filtragem por fornecedor acontece no service). Aplica
 * sozinho ao parar de digitar (debounce), sem recarregar a página — atualiza o
 * `?q=` na URL via router.push (scroll:false) dentro de uma transição. Um guard
 * no efeito evita loop (só empurra quando o termo diverge da URL).
 */
export function CatalogSearchField(): React.ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);

  // Sincroniza o campo quando a URL muda por fora (ex.: limpar filtros, busca do header).
  useEffect(() => {
    setValue(urlQuery);
  }, [urlQuery]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === urlQuery) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      params.delete("pagina");
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="group relative">
      <Search className="text-muted-foreground group-focus-within:text-primary pointer-events-none absolute top-1/2 left-4 size-[18px] -translate-y-1/2 transition-colors duration-200" />
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Pesquisar produtos..."
        aria-label="Pesquisar produtos por nome, código ou fornecedor"
        className="border-input bg-background hover:border-primary/40 focus-visible:ring-ring focus-visible:ring-offset-background placeholder:text-muted-foreground/80 h-11 w-full rounded-lg border pr-10 pl-11 text-sm shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Limpar busca"
          className="text-muted-foreground hover:bg-muted hover:text-foreground absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center rounded-full transition"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
