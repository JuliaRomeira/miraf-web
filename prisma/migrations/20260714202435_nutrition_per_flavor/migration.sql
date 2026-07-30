-- A tabela nutricional passa a poder pertencer a um sabor (ProductFlavor), além
-- de a um produto. Ambos os vínculos ficam opcionais e únicos; a aplicação
-- garante que apenas um é preenchido. Não-destrutivo: relaxa o NOT NULL de
-- productId e adiciona flavorId (nulo nas linhas existentes, que seguem no
-- nível do produto).

-- AlterTable
ALTER TABLE "NutritionFacts" ADD COLUMN     "flavorId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "NutritionFacts_flavorId_key" ON "NutritionFacts"("flavorId");

-- AddForeignKey
ALTER TABLE "NutritionFacts" ADD CONSTRAINT "NutritionFacts_flavorId_fkey" FOREIGN KEY ("flavorId") REFERENCES "ProductFlavor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
