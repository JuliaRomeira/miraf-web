-- DropIndex
DROP INDEX "QuoteItem_quoteId_productId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "technicalSheetUrl",
ADD COLUMN     "saleUnit" TEXT NOT NULL DEFAULT 'unidade';

-- AlterTable
ALTER TABLE "QuoteItem" ADD COLUMN     "flavor" TEXT,
ADD COLUMN     "unit" TEXT;

-- CreateTable
CREATE TABLE "ProductFlavor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productId" TEXT NOT NULL,

    CONSTRAINT "ProductFlavor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductFlavor_productId_idx" ON "ProductFlavor"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteItem_quoteId_productId_flavor_key" ON "QuoteItem"("quoteId", "productId", "flavor");

-- AddForeignKey
ALTER TABLE "ProductFlavor" ADD CONSTRAINT "ProductFlavor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

