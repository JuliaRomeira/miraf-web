"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface UploadedImage {
  url: string;
  isPrimary: boolean;
}

interface ImageUploadProps {
  /**
   * Nome do input hidden que carrega o JSON das imagens (modo não-controlado).
   * Omitir quando usar `value`/`onChange` (controlado, ex.: galeria por sabor).
   */
  readonly name?: string;
  /** Pasta de destino no servidor (ex.: "products"). */
  readonly folder: string;
  readonly initial?: readonly UploadedImage[];
  /** Modo controlado: lista atual de imagens. */
  readonly value?: readonly UploadedImage[];
  /** Modo controlado: callback com a nova lista (normalizada). */
  readonly onChange?: (images: UploadedImage[]) => void;
}

/** Garante que exista exatamente uma imagem de capa (a primeira, por padrão). */
function normalizePrimary(images: UploadedImage[]): UploadedImage[] {
  if (images.length === 0) {
    return images;
  }
  const primaryIndex = images.findIndex((image) => image.isPrimary);
  const target = primaryIndex === -1 ? 0 : primaryIndex;
  return images.map((image, index) => ({ ...image, isPrimary: index === target }));
}

/**
 * Upload de imagens direto do computador. Ao selecionar arquivos, cada um é
 * enviado para `/api/admin/upload`; o servidor faz o upload real e devolve a
 * URL, que fica só no estado do formulário (input hidden) e é salva no banco.
 */
export function ImageUpload({
  name,
  folder,
  initial = [],
  value,
  onChange,
}: ImageUploadProps): React.ReactElement {
  const controlled = onChange !== undefined;
  const [internal, setInternal] = useState<UploadedImage[]>(() => normalizePrimary([...initial]));
  const images = controlled ? normalizePrimary([...(value ?? [])]) : internal;
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = (next: UploadedImage[]): void => {
    const normalized = normalizePrimary(next);
    if (controlled) onChange?.(normalized);
    else setInternal(normalized);
  };

  const handleFiles = async (fileList: FileList | null): Promise<void> => {
    if (!fileList || fileList.length === 0) {
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const uploaded: UploadedImage[] = [];
      for (const file of Array.from(fileList)) {
        const body = new FormData();
        body.append("file", file);
        body.append("folder", folder);
        const response = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await response.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
        };
        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "Falha ao enviar a imagem.");
        }
        uploaded.push({ url: data.url, isPrimary: false });
      }
      commit([...images, ...uploaded]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const removeImage = (url: string): void => {
    commit(images.filter((image) => image.url !== url));
  };

  const setPrimary = (url: string): void => {
    commit(images.map((image) => ({ ...image, isPrimary: image.url === url })));
  };

  return (
    <div className="space-y-3">
      {name && <input type="hidden" name={name} value={JSON.stringify(images)} />}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(event) => void handleFiles(event.target.files)}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <>
            <Loader2 className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <ImagePlus />
            Selecionar imagem
          </>
        )}
      </Button>

      {error && <p className="text-destructive text-sm">{error}</p>}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <li key={image.url} className="border-border overflow-hidden rounded-md border">
              <div className="bg-muted relative aspect-square">
                <Image src={image.url} alt="" fill sizes="200px" className="object-cover" />
              </div>
              <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                <button
                  type="button"
                  onClick={() => setPrimary(image.url)}
                  className={cn(
                    "inline-flex items-center gap-1 text-xs font-medium transition-colors",
                    image.isPrimary
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={image.isPrimary ? "Imagem de capa" : "Definir como capa"}
                >
                  <Star className={cn("size-3.5", image.isPrimary && "fill-current")} />
                  {image.isPrimary ? "Capa" : "Definir capa"}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image.url)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remover imagem"
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
