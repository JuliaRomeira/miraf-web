import { saveUploadLocally } from "./local";
import { UPLOAD_FOLDERS, type UploadFolder, type UploadInput, type UploadResult } from "./types";

/** Formatos de imagem aceitos no upload. */
export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

/** Rótulo amigável dos formatos, para mensagens de erro. */
export const ALLOWED_IMAGE_LABEL = "PNG, JPG, JPEG ou WebP";

/** Formatos aceitos na pasta "documents" (ficha técnica): PDF ou imagem. */
export const ALLOWED_DOCUMENT_TYPES = ["application/pdf", ...ALLOWED_IMAGE_TYPES] as const;
export type AllowedDocumentType = (typeof ALLOWED_DOCUMENT_TYPES)[number];

/** Rótulo amigável dos formatos de documento, para mensagens de erro. */
export const ALLOWED_DOCUMENT_LABEL = "PDF, PNG, JPG, JPEG ou WebP";

/**
 * Formatos aceitos por pasta de upload. A maioria só aceita imagem; "documents"
 * (ficha técnica) também aceita PDF.
 */
export function allowedTypesForFolder(folder: UploadFolder): readonly string[] {
  return folder === "documents" ? ALLOWED_DOCUMENT_TYPES : ALLOWED_IMAGE_TYPES;
}

/** Rótulo amigável dos formatos aceitos por pasta (para mensagens de erro). */
export function allowedLabelForFolder(folder: UploadFolder): string {
  return folder === "documents" ? ALLOWED_DOCUMENT_LABEL : ALLOWED_IMAGE_LABEL;
}

/** Tamanho máximo por imagem, em MB (fonte única — usado no limite e nas mensagens). */
export const MAX_IMAGE_MB = 20;

/** Tamanho máximo por imagem, em bytes. */
export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;

export { UPLOAD_FOLDERS };

/** Valida (type guard) se o valor é uma pasta de upload permitida. */
export function isValidUploadFolder(value: unknown): value is UploadFolder {
  return typeof value === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(value);
}

/**
 * Faz o upload de uma imagem para o armazenamento local do servidor (VPS).
 * Sem serviços de terceiros; salva apenas o caminho no banco.
 */
export async function uploadImage(input: UploadInput): Promise<UploadResult> {
  return saveUploadLocally(input);
}

export type { UploadFolder, UploadInput, UploadResult };
