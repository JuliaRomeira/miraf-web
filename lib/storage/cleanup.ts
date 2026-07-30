import { unlink } from "node:fs/promises";
import { join, normalize, sep } from "node:path";

import { prisma } from "@/lib/prisma";

const UPLOADS_URL_PREFIX = "/uploads/";

/** Verifica se um caminho de upload ainda é referenciado por algum registro. */
export async function isUploadPathInUse(path: string): Promise<boolean> {
  const [productImages, flavorImages, suppliers, categories, productDocs, flavorDocs] =
    await Promise.all([
      prisma.productImage.count({ where: { url: path } }),
      prisma.productFlavor.count({ where: { imageUrl: path } }),
      prisma.supplier.count({ where: { logoUrl: path } }),
      prisma.category.count({ where: { imageUrl: path } }),
      // Ficha técnica (PDF/imagem) do produto e das variações.
      prisma.product.count({ where: { technicalSheetUrl: path } }),
      prisma.productFlavor.count({ where: { technicalSheetUrl: path } }),
    ]);
  return productImages + flavorImages + suppliers + categories + productDocs + flavorDocs > 0;
}

/**
 * Remove o arquivo físico de um upload local — DESDE QUE não esteja mais em uso
 * por nenhum registro. Best-effort: falha ao apagar não interrompe a operação
 * de negócio (o banco é a fonte da verdade).
 */
export async function deleteLocalUploadIfUnused(path: string | null | undefined): Promise<void> {
  if (!path || !path.startsWith(UPLOADS_URL_PREFIX)) {
    return; // gerencia apenas uploads locais (ignora URLs externas legadas)
  }
  if (await isUploadPathInUse(path)) {
    return; // ainda usado por outro registro
  }

  const uploadsDir = join(process.cwd(), "public", "uploads");
  const absolute = normalize(join(process.cwd(), "public", path));
  // Proteção contra path traversal: o alvo precisa estar dentro de public/uploads.
  if (!absolute.startsWith(uploadsDir + sep)) {
    return;
  }

  try {
    await unlink(absolute);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("Falha ao remover arquivo de upload:", path, error);
    }
  }
}
