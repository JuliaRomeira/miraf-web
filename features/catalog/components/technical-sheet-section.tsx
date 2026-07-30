"use client";

import { useState } from "react";
import { Download, FileText, Maximize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface TechnicalSheetSectionProps {
  /** Caminho do documento (PDF ou imagem). */
  readonly url: string;
  /** Nome do produto/variação, para o alt/título. */
  readonly label: string;
}

function isPdf(url: string): boolean {
  return url.toLowerCase().endsWith(".pdf");
}

/**
 * Seção "Ficha técnica" da página de produto. Mostra um cartão discreto; ao
 * clicar, abre o documento em modal (lightbox): PDF num visualizador embutido
 * (com link para baixar) ou imagem em tamanho grande, rolável. A seção só é
 * renderizada quando há documento (o pai não a monta se `url` estiver ausente).
 */
export function TechnicalSheetSection({
  url,
  label,
}: TechnicalSheetSectionProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const pdf = isPdf(url);

  return (
    <section>
      <h2 className="font-display mb-4 flex items-center gap-2.5 text-xl font-bold tracking-tight">
        <span aria-hidden className="bg-primary h-5 w-1 shrink-0 rounded-full" />
        Ficha técnica
      </h2>

      <div className="border-border/70 bg-card shadow-soft hover:shadow-soft-md flex items-center gap-4 rounded-2xl border p-4 transition-shadow duration-300 sm:p-5">
        <div className="bg-accent text-primary flex size-14 shrink-0 items-center justify-center rounded-xl">
          <FileText className="size-7" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Ficha técnica do produto</p>
          <p className="text-muted-foreground text-sm">
            {pdf ? "Documento PDF" : "Documento em imagem"} · abre em visualização
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(true)}
            className="border-primary/40 text-primary hover:bg-accent font-semibold transition-all duration-200 active:scale-[0.98]"
          >
            <Maximize2 className="size-4" />
            Ver ficha técnica
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ficha técnica — {label}</DialogTitle>
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-auto">
            {pdf ? (
              <iframe
                src={url}
                title={`Ficha técnica — ${label}`}
                className="h-[70vh] w-full rounded-md border"
              />
            ) : (
              <div className="relative flex justify-center">
                {/* Imagem em tamanho natural (rolável no container). */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Ficha técnica — ${label}`} className="h-auto max-w-full" />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button asChild variant="outline">
              <a href={url} target="_blank" rel="noopener noreferrer" download>
                <Download className="size-4" />
                Baixar
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
