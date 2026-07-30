-- CreateEnum
CREATE TYPE "NutrientKind" AS ENUM ('ENERGY', 'CARBOHYDRATES', 'SUGARS_TOTAL', 'SUGARS_ADDED', 'PROTEIN', 'FATS_TOTAL', 'FATS_SATURATED', 'FATS_TRANS', 'FIBER', 'SODIUM', 'OTHER');

-- CreateTable
CREATE TABLE "NutritionFacts" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "servingsPerPackage" TEXT,
    "servingAmount" TEXT NOT NULL,
    "servingHousehold" TEXT,
    "referenceAmount" TEXT NOT NULL DEFAULT '100 g',
    "footnote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionFacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionRow" (
    "id" TEXT NOT NULL,
    "nutritionFactsId" TEXT NOT NULL,
    "kind" "NutrientKind" NOT NULL,
    "label" TEXT,
    "unit" TEXT,
    "valuePer100" DECIMAL(10,2),
    "valuePerServing" DECIMAL(10,2),
    "dailyValuePercent" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "NutritionRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NutritionFacts_productId_key" ON "NutritionFacts"("productId");

-- CreateIndex
CREATE INDEX "NutritionRow_nutritionFactsId_idx" ON "NutritionRow"("nutritionFactsId");

-- AddForeignKey
ALTER TABLE "NutritionFacts" ADD CONSTRAINT "NutritionFacts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NutritionRow" ADD CONSTRAINT "NutritionRow_nutritionFactsId_fkey" FOREIGN KEY ("nutritionFactsId") REFERENCES "NutritionFacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
