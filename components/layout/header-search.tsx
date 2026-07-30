"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { GlobalSearch } from "@/components/layout/global-search";
import { cn } from "@/lib/utils";

/**
 * Busca do cabeçalho: a "lupa" ao lado do CTA de cotação. Ao clicar, abre um
 * popover com a busca global (sugestões em tempo real de produtos, categorias e
 * fornecedores). É a única entrada de busca textual do site — o catálogo cuida
 * só dos filtros.
 */
export function HeaderSearch({
  className,
  light = false,
}: {
  className?: string;
  /** Variante clara para o cabeçalho transparente sobre o hero. */
  light?: boolean;
}): React.ReactElement {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou pressionar Esc.
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-label={open ? "Fechar busca" : "Buscar no site"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex size-10 items-center justify-center rounded-full transition-colors",
          light
            ? "text-white hover:bg-white/15"
            : "text-muted-foreground hover:text-primary hover:bg-accent",
        )}
      >
        {open ? <X className="size-5" /> : <Search className="size-5" />}
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-80">
          <GlobalSearch autoFocus onNavigate={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
