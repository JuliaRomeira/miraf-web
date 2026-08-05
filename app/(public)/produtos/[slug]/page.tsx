import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { ExploreCategories } from "@/features/catalog/components/explore-categories";
import { ProductHelpCta } from "@/features/catalog/components/product-detail-parts";
import {
  ProductDetailView,
  type DetailVariation,
  type ProductDetailData,
} from "@/features/catalog/components/product-detail-view";
import { RelatedProducts } from "@/features/catalog/components/related-products";
import { getPublicProductBySlug } from "@/features/catalog/services/catalog-service";
import { buildNutritionView } from "@/features/nutrition/services/nutrition-view";
import { getSiteSettings } from "@/features/settings/services/site-settings";
import { renderRichText } from "@/lib/sanitize-html";
import { onlyDigits } from "@/utils";
import { ROUTES } from "@/constants";

/** Base absoluta para URLs em JSON-LD (Schema.org). */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const toAbsoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${APP_URL}${path}`;

interface ProductDetailPageProps {
  readonly params: Promise<{ slug: string }>;
}

/** Resumo curto derivado da descrição, para o `<meta name="description">`.
 *  A descrição pode conter HTML (editor rico) — removemos as tags antes. */
function metaSummary(description: string): string {
  const clean = description
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > 155 ? `${clean.slice(0, 152).trimEnd()}…` : clean;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado" };
  }

  const title = product.metaTitle ?? product.name;
  const description =
    product.metaDescription ??
    (product.shortDescription?.trim()
      ? product.shortDescription
      : metaSummary(product.description));
  const cover = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: ROUTES.productDetail(product.slug) },
    openGraph: {
      title,
      description,
      images: cover ? [{ url: cover.url, alt: cover.alt ?? product.name }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getPublicProductBySlug(slug), getSiteSettings()]);

  if (!product) {
    notFound();
  }

  const whatsappDigits = onlyDigits(settings.contactWhatsapp) || null;

  // Descrição do produto (sanitizada) — também é o fallback das variações.
  const productDescriptionHtml = renderRichText(product.description);
  const richOrEmpty = (value: string | null): string =>
    value?.trim() ? renderRichText(value) : "";

  const variations: DetailVariation[] = product.flavors.map((flavor) => ({
    id: flavor.id,
    name: flavor.name,
    images: flavor.images.map((image) => ({ url: image.url, alt: image.alt })),
    sku: flavor.sku,
    weight: flavor.weight,
    descriptionHtml: flavor.description?.trim()
      ? renderRichText(flavor.description)
      : productDescriptionHtml,
    available: flavor.available,
    technicalSheetUrl: flavor.technicalSheetUrl,
    nutrition: flavor.nutrition ? buildNutritionView(flavor.nutrition) : null,
  }));

  const data: ProductDetailData = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    saleUnit: product.saleUnit,
    supplierName: product.supplier?.name ?? null,
    sku: product.sku,
    weight: product.weight,
    packaging: product.packaging,
    shortDescription: product.shortDescription,
    highlights: product.highlights,
    descriptionHtml: productDescriptionHtml,
    compositionHtml: richOrEmpty(product.composition),
    applicationHtml: richOrEmpty(product.application),
    conservationHtml: richOrEmpty(product.conservation),
    preparationHtml: richOrEmpty(product.preparation),
    technicalSheetUrl: product.technicalSheetUrl,
    nutrition: product.nutrition ? buildNutritionView(product.nutrition) : null,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt })),
  };

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription?.trim() || metaSummary(product.description),
    ...(product.images.length > 0
      ? { image: product.images.map((image) => toAbsoluteUrl(image.url)) }
      : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(product.supplier?.name ? { brand: { "@type": "Brand", name: product.supplier.name } } : {}),
    category: product.category.name,
    url: toAbsoluteUrl(ROUTES.productDetail(product.slug)),
  };

  return (
    <section className="mx-auto w-full max-w-7xl min-w-0 px-4 py-10 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <nav
        aria-label="Trilha de navegação"
        className="mb-7 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm"
      >
        <Link
          href={ROUTES.products}
          className="text-muted-foreground hover:text-primary font-medium transition-colors"
        >
          Produtos
        </Link>
        <ChevronRight className="text-muted-foreground/50 size-4" />
        <Link
          href={`${ROUTES.products}?categoria=${product.category.slug}`}
          className="text-muted-foreground hover:text-primary font-medium transition-colors"
        >
          {product.category.name}
        </Link>
        {product.subcategory && (
          <>
            <ChevronRight className="text-muted-foreground/50 size-4" />
            <Link
              href={`${ROUTES.products}?categoria=${product.subcategory.slug}`}
              className="text-muted-foreground hover:text-primary font-medium transition-colors"
            >
              {product.subcategory.name}
            </Link>
          </>
        )}
        <ChevronRight className="text-muted-foreground/50 size-4" />
        <span className="text-foreground font-semibold">{product.name}</span>
      </nav>

      <ProductDetailView product={data} variations={variations} />

      <ProductHelpCta whatsappDigits={whatsappDigits} />

      {product.relatedProducts.length > 0 && <RelatedProducts products={product.relatedProducts} />}

      <ExploreCategories currentCategorySlug={product.category.slug} />
    </section>
  );
}
