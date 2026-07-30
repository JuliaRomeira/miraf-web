/** Pastas permitidas para upload (organização por entidade). */
export const UPLOAD_FOLDERS = [
  "products",
  "suppliers",
  "categories",
  "flavors",
  "documents",
] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];

export interface UploadInput {
  buffer: Buffer;
  mimeType: string;
  folder: UploadFolder;
}

export interface UploadResult {
  /** Caminho público relativo salvo no banco (ex.: `/uploads/products/<uuid>.png`). */
  path: string;
}
