"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { FileText, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SingleDocumentUploadProps {
  /** Modo não-controlado: grava o caminho num input oculto lido pelo FormData. */
  readonly name?: string;
  /** Modo controlado: valor atual (para compor JSON, ex.: sabores). */
  readonly value?: string;
  /** Modo controlado: callback com o novo caminho ("" ao remover). */
  readonly onChange?: (path: string) => void;
  /** Valor inicial no modo não-controlado. */
  readonly initialUrl?: string;
  /** Rótulo acessível do botão de seleção. */
  readonly label?: string;
}

/** É PDF pelo sufixo do caminho? (senão tratamos como imagem). */
function isPdf(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf");
}

/**
 * Upload de um único documento (ficha técnica): PDF ou imagem. Envia para
 * `/api/admin/upload` na pasta "documents" e guarda só o caminho. Funciona em
 * dois modos: `name` (input oculto, nível do produto) ou `value`/`onChange`
 * (controlado, dentro do JSON dos sabores).
 */
export function SingleDocumentUpload({
  name,
  value,
  onChange,
  initialUrl = "",
  label = "Selecionar arquivo",
}: SingleDocumentUploadProps): React.ReactElement {
  const controlled = onChange !== undefined;
  const [internal, setInternal] = useState(initialUrl);
  const path = controlled ? (value ?? "") : internal;

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const setPath = (next: string): void => {
    if (controlled) onChange?.(next);
    else setInternal(next);
  };

  const handleFile = async (fileList: FileList | null): Promise<void> => {
    const file = fileList?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", "documents");
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Falha ao enviar o arquivo.");
      }
      setPath(data.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Falha ao enviar o arquivo.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {name && <input type="hidden" name={name} value={path} />}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/png,image/jpeg,image/webp"
        className="hidden"
        aria-label={label}
        onChange={(event) => void handleFile(event.target.files)}
      />

      {path ? (
        <div className="border-border flex items-center gap-3 rounded-lg border p-2.5">
          <div className="bg-muted text-muted-foreground relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded">
            {isPdf(path) ? (
              <FileText className="size-6" aria-hidden />
            ) : (
              <Image src={path} alt="" fill sizes="56px" className="object-contain" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {isPdf(path) ? "Documento PDF" : "Imagem"}
            </p>
            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-xs hover:underline"
            >
              Abrir arquivo
            </a>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "Enviando..." : "Trocar"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remover ficha técnica"
              onClick={() => setPath("")}
            >
              <X className="size-4" />
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
              <Upload />
              {label}
            </>
          )}
        </Button>
      )}

      <p className="text-muted-foreground text-xs">PDF ou imagem (máx. 20 MB).</p>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
