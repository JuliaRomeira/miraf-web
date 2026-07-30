import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";

import { listActiveCategoryTree } from "@/features/catalog/services/catalog-service";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Categorias",
  description: "Navegue pelas categorias de produtos da Mira.",
};

export default async function CategoriesPage(): Promise<React.ReactElement> {
  const categories = await listActiveCategoryTree();

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground">Escolha uma categoria para ver os produtos.</p>
      </header>

      {categories.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-12 text-center">
          Nenhuma categoria disponível no momento.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`${ROUTES.products}?categoria=${category.slug}`}
                className="group border-border bg-card block overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
              >
                <div className="bg-muted relative aspect-video overflow-hidden">
                  {category.imageUrl ? (
                    <Image
                      src={category.imageUrl}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center">
                      <ImageOff className="size-8" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="font-medium">{category.name}</h2>
                  <p className="text-muted-foreground text-xs">
                    {category.totalActiveProducts} produto
                    {category.totalActiveProducts === 1 ? "" : "s"}
                  </p>
                  {category.children.length > 0 && (
                    <p className="text-muted-foreground/80 mt-1 line-clamp-1 text-xs">
                      {category.children.map((child) => child.name).join(" · ")}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
