"use client";

import { useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CollapsibleMediaProps {
  /** Altura máxima da prévia (px). Acima disso, recorta e oferece "Ver completo". */
  readonly maxHeight?: number;
  /** Título do modal. */
  readonly modalTitle: string;
  /** Rótulo do botão que abre o modal. */
  readonly buttonLabel: string;
  readonly children: React.ReactNode;
}

/**
 * Exibe um conteúdo (ex.: tabela nutricional) com **altura máxima**. Mede a
 * altura real após montar: se couber, mostra inteiro; se ultrapassar, recorta
 * com um degradê (fade) na base e oferece um botão "Ver completo" que abre o
 * conteúdo num modal rolável. Automático — nada de regra fixa por produto.
 */
export function CollapsibleMedia({
  maxHeight = 450,
  modalTitle,
  buttonLabel,
  children,
}: CollapsibleMediaProps): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = (): void => setOverflowing(el.scrollHeight > maxHeight + 8);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [maxHeight]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          ref={ref}
          className={cn(overflowing && "overflow-hidden")}
          style={overflowing ? { maxHeight } : undefined}
        >
          {children}
        </div>
        {overflowing && (
          <div
            aria-hidden
            className="from-card pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-2xl bg-gradient-to-t to-transparent"
          />
        )}
      </div>

      {overflowing && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-primary/40 text-primary hover:bg-accent w-full font-semibold transition-all duration-200 active:scale-[0.99]"
        >
          <Maximize2 className="size-4" />
          {buttonLabel}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modalTitle}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </div>
  );
}
