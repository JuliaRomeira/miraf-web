"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SingleImageUploadProps {
  /** Nome do input hidden que carrega o caminho para o Server Action. */
  readonly name: string;
  /** Pasta de destino no servidor (ex.: "brands"). */
  readonly folder: string;
  readonly initialUrl?: string;
}

/**
 * Upload de uma única imagem (ex.: logo de fornecedor). Ao selecionar o arquivo,
 * ele é enviado para `/api/admin/upload` e apenas a URL gerada fica no
 * formulário (input hidden), sem digitar URL manualmente.
 */
export function SingleImageUpload({
  name,
  folder,
  initialUrl = "",
}: SingleImageUploadProps): React.ReactElement {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (fileList: FileList | null): Promise<void> => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Falha ao enviar a imagem.");
      }
      setUrl(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar a imagem.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleFile(event.target.files)}
      />

      {url ? (
        <div className="flex items-center gap-3">
          <div className="bg-muted relative size-20 shrink-0 overflow-hidden rounded border">
            <Image src={url} alt="" fill sizes="80px" className="object-contain" />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando..." : "Trocar"}
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setUrl("")}>
              <X className="size-4" />
              Remover
            </Button>
          </div>
        </div>
      ) : (
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
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
