import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { UploadInput, UploadResult } from "./types";

/**
 * Extensão canônica por MIME aceito. O nome do arquivo é sempre derivado daqui
 * (nunca do nome enviado pelo usuário) — evita traversal e extensões forjadas.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

/**
 * Salva a imagem no próprio servidor (VPS), em
 * `public/uploads/<folder>/<uuid>.<ext>`. O nome é um UUID (evita conflitos e
 * não expõe o nome original). Retorna apenas o caminho público relativo — o
 * arquivo nunca vai para o banco.
 *
 * Deploy: `public/uploads` deve ser um volume persistente no container (Docker
 * standalone) para os arquivos sobreviverem a redeploys; opcionalmente servido
 * pelo Nginx.
 */
export async function saveUploadLocally(input: UploadInput): Promise<UploadResult> {
  const extension = EXTENSION_BY_MIME[input.mimeType];
  if (!extension) {
    throw new Error("Formato de imagem não suportado.");
  }

  const fileName = `${randomUUID()}.${extension}`;
  const directory = join(process.cwd(), "public", "uploads", input.folder);

  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, fileName), input.buffer);

  return { path: `/uploads/${input.folder}/${fileName}` };
}
