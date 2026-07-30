"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff, Maximize2, ZoomIn } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface GalleryImage {
  url: string;
  alt: string | null;
  /** Variação (sabor) a que a imagem pertence. null = imagem de produto sem variações. */
  flavorId?: string | null;
  flavorName?: string | null;
}

interface ProductGalleryProps {
  /** Imagem principal (grande) exibida no momento. */
  readonly mainImage: GalleryImage | null;
  /** Miniaturas da tira vertical. Vazio = sem tira (só a imagem principal). */
  readonly thumbnails: readonly GalleryImage[];
  /**
   * Índice (na lista `thumbnails`) da miniatura ativa. Destacar POR ÍNDICE — e não
   * por URL — é essencial: variações diferentes podem reusar a MESMA imagem, e
   * comparar por URL destacaria todas as miniaturas com aquele arquivo.
   */
  readonly activeIndex: number;
  /** Disparado ao clicar numa miniatura (índice) — o pai sincroniza sabor + imagem + infos. */
  readonly onSelect?: (index: number) => void;
  readonly name: string;
}

/**
 * Galeria da página de produto — COMPONENTE CONTROLADO. Imagem principal grande +
 * (opcional) tira VERTICAL de miniaturas à esquerda. O pai decide o conteúdo:
 * quando o produto tem variações, `thumbnails` recebe TODAS as imagens de TODAS as
 * variações (cada uma marcada com seu `flavorId`); clicar numa miniatura chama
 * `onSelect(index)`, e o pai seleciona o sabor daquela imagem e atualiza a
 * interface. Produto sem variações: `thumbnails` vazio → só a imagem principal.
 *
 * Acabamento: card com borda + sombra suave, produto ocupando ~85% da área
 * (padding enxuto), zoom sutil no hover (desktop), transição de fade ao trocar de
 * imagem e ampliação em tela cheia (lightbox) ao clicar.
 */
export function ProductGallery({
  mainImage,
  thumbnails,
  activeIndex,
  onSelect,
  name,
}: ProductGalleryProps): React.ReactElement {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!mainImage && thumbnails.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground/40 flex aspect-square items-center justify-center rounded-2xl border">
        <ImageOff className="size-12" />
      </div>
    );
  }

  const main = mainImage ?? thumbnails[0] ?? null;

  return (
    <div className="flex gap-3 sm:gap-4">
      {thumbnails.length > 0 && (
        <ul className="flex max-h-[32rem] w-16 shrink-0 [scrollbar-width:thin] flex-col gap-2.5 overflow-y-auto pr-1 sm:w-20">
          {thumbnails.map((image, index) => {
            const active = index === activeIndex;
            return (
              <li key={`${image.flavorId ?? "p"}-${index}`}>
                <button
                  type="button"
                  onClick={() => onSelect?.(index)}
                  aria-label={
                    image.flavorName
                      ? `Ver imagem de ${image.flavorName}`
                      : `Ver imagem ${index + 1}`
                  }
                  aria-current={active}
                  title={image.flavorName ?? undefined}
                  className={cn(
                    "relative aspect-square w-full overflow-hidden rounded-xl border bg-white transition-all duration-200 ease-out",
                    active
                      ? "border-primary ring-primary/25 shadow-soft scale-[1.02] ring-2"
                      : "border-border hover:border-primary/50 hover:shadow-soft opacity-80 hover:opacity-100",
                  )}
                >
                  <Image
                    src={image.url}
                    alt=""
                    fill
                    loading="lazy"
                    sizes="80px"
                    className="object-contain p-1.5"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="min-w-0 flex-1">
        <button
          type="button"
          onClick={() => main && setLightboxOpen(true)}
          aria-label="Ampliar imagem do produto"
          className={cn(
            "group border-border/70 shadow-soft focus-visible:ring-ring hover:shadow-soft-md relative flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border bg-white transition-shadow duration-300 ease-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
          )}
        >
          {main && (
            <Image
              key={`${main.url}-${activeIndex}`}
              src={main.url}
              alt={main.alt ?? name}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              priority
              className="animate-in fade-in-0 object-contain p-4 duration-500 ease-out group-hover:scale-[1.05] motion-safe:transition-transform motion-safe:duration-500 sm:p-5"
            />
          )}
          {/* Dica de ampliação — discreta, aparece no hover (desktop). */}
          <span
            aria-hidden
            className="text-muted-foreground bg-background/85 pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-100"
          >
            <ZoomIn className="size-3.5" />
            Ampliar
          </span>
        </button>
      </div>

      {/* Lightbox / visualização em tela cheia. */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="w-full max-w-4xl overflow-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="pr-8">
              {main?.flavorName ? `${name} — ${main.flavorName}` : name}
            </DialogTitle>
          </DialogHeader>
          {main && (
            <div className="bg-muted/30 relative aspect-square w-full overflow-hidden rounded-xl">
              <Image
                src={main.url}
                alt={main.alt ?? name}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="animate-in fade-in-0 object-contain p-4 duration-300 sm:p-8"
              />
            </div>
          )}
          {thumbnails.length > 1 && (
            <ul className="flex flex-wrap justify-center gap-2">
              {thumbnails.map((image, index) => {
                const active = index === activeIndex;
                return (
                  <li key={`lb-${image.flavorId ?? "p"}-${index}`}>
                    <button
                      type="button"
                      onClick={() => onSelect?.(index)}
                      aria-label={
                        image.flavorName
                          ? `Ver imagem de ${image.flavorName}`
                          : `Ver imagem ${index + 1}`
                      }
                      aria-current={active}
                      className={cn(
                        "relative size-14 overflow-hidden rounded-lg border bg-white transition-all duration-200",
                        active
                          ? "border-primary ring-primary/25 ring-2"
                          : "border-border hover:border-primary/50 opacity-75 hover:opacity-100",
                      )}
                    >
                      <Image
                        src={image.url}
                        alt=""
                        fill
                        loading="lazy"
                        sizes="56px"
                        className="object-contain p-1"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs">
            <Maximize2 className="size-3.5" />
            Toque fora ou pressione Esc para fechar
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
