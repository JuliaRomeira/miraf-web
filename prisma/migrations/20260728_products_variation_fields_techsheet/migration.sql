-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "application" TEXT,
ADD COLUMN     "composition" TEXT,
ADD COLUMN     "conservation" TEXT,
ADD COLUMN     "technicalSheetUrl" TEXT;

-- AlterTable
ALTER TABLE "ProductFlavor" ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "technicalSheetUrl" TEXT,
ADD COLUMN     "weight" TEXT;
