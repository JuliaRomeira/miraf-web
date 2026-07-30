-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "flavorId" TEXT;

-- CreateIndex
CREATE INDEX "ProductImage_flavorId_idx" ON "ProductImage"("flavorId");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_flavorId_fkey" FOREIGN KEY ("flavorId") REFERENCES "ProductFlavor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migração de dados: cada ProductFlavor.imageUrl vira a 1ª imagem (capa) da
-- galeria daquela variação, preservando as fotos já cadastradas.
INSERT INTO "ProductImage" ("id", "url", "alt", "order", "isPrimary", "createdAt", "productId", "flavorId")
SELECT
  gen_random_uuid()::text,
  f."imageUrl",
  NULL,
  0,
  true,
  now(),
  f."productId",
  f."id"
FROM "ProductFlavor" f
WHERE f."imageUrl" IS NOT NULL AND f."imageUrl" <> '';
