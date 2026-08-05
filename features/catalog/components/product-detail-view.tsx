"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/shared/quantity-stepper";
import { ProductGallery } from "@/features/catalog/components/product-gallery";
import { NutritionSection } from "@/features/catalog/components/nutrition-section";
import { TechnicalSheetSection } from "@/features/catalog/components/technical-sheet-section";
import { RichHtmlSection } from "@/features/catalog/components/rich-html-section";
import {
  ProductHighlights,
  ProductSpecs,
} from "@/features/catalog/components/product-detail-parts";
import type { NutritionView } from "@/features/nutrition/services/nutrition-view";
import { useQuoteCart } from "@/features/quote/store/quote-cart-context";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants";

export interface DetailVariation {
  readonly id: string;
  readonly name: string;
  /** Galeria própria da variação (frente, verso, embalagem…). */
  readonly images: readonly { url: string; alt: string | null }[];
  readonly sku: string | null;
  readonly weight: string | null;
  /** Descrição já sanitizada (fallback para a do produto quando vazia). */
  readonly descriptionHtml: string;
  readonly available: boolean;
  readonly technicalSheetUrl: string | null;
  readonly nutrition: NutritionView | null;
}

export interface ProductDetailData {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly saleUnit: string;
  readonly supplierName: string | null;
  readonly sku: string | null;
  readonly weight: string | null;
  readonly packaging: string | null;
  readonly shortDescription: string | null;
  readonly highlights: readonly string[];
  /** Blocos de conteúdo já sanitizados no servidor (vazio = não exibe). */
  readonly descriptionHtml: string;
  readonly compositionHtml: string;
  readonly applicationHtml: string;
  readonly conservationHtml: string;
  readonly preparationHtml: string;
  readonly technicalSheetUrl: string | null;
  readonly nutrition: NutritionView | null;
  readonly images: readonly { url: string; alt: string | null }[];
}

interface ProductDetailViewProps {
  readonly product: ProductDetailData;
  readonly variations: readonly DetailVariation[];
}

/**
 * Página de detalhe do produto — visão única para produtos com e sem variações.
 * Produto sem variações = uma "variação-padrão" derivada do próprio produto
 * (zero duplicação). O foco é o PRODUTO: imagem grande + CTA.
 *
 * Coluna esquerda: galeria (tira vertical de miniaturas + imagem principal). As
 * miniaturas são as IMAGENS da variação selecionada; trocar de sabor troca a
 * galeria inteira (remount por `key`). O seletor de sabor é separado (chips de
 * texto na coluna direita) e, ao mudar, atualiza de forma reativa a galeria,
 * SKU, peso, descrição, tabela nutricional e ficha técnica — sem recarregar.
 *
 * Layout: (1) topo — galeria (esq.) | coluna direita na ordem título →
 * fornecedor → SKU → sabores → quantidade+botão → especificações → benefícios;
 * (2) conteúdo — descrição (65%) ao lado dos documentos (35%) quando existem;
 * senão, descrição em largura de leitura.
 */
export function ProductDetailView({
  product,
  variations,
}: ProductDetailViewProps): React.ReactElement {
  const hasVariations = variations.length > 0;

  const initialId = (variations.find((v) => v.available) ?? variations[0])?.id ?? "";
  const [selectedId, setSelectedId] = useState(initialId);
  const selected = hasVariations
    ? (variations.find((v) => v.id === selectedId) ?? variations[0])
    : undefined;

  // Tira vertical de miniaturas = TODAS as imagens de TODAS as variações (cada uma
  // marcada com o sabor a que pertence). Só existe quando o produto tem variações.
  const variationThumbnails = useMemo(
    () =>
      variations.flatMap((v) =>
        v.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          flavorId: v.id,
          flavorName: v.name,
        })),
      ),
    [variations],
  );

  // Miniatura ativa identificada por ÍNDICE (não por URL): variações podem reusar
  // a mesma imagem, então comparar por URL destacaria mais de uma miniatura.
  // Começa na 1ª imagem do sabor inicial (ou na 1ª da tira).
  const initialIndex = Math.max(
    0,
    variationThumbnails.findIndex((img) => img.flavorId === initialId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  // Selecionar SABOR (via botão): troca o sabor e leva a imagem principal para a 1ª
  // imagem daquele sabor (a 1ª miniatura da tira que pertence a ele).
  const selectFlavor = (id: string): void => {
    setSelectedId(id);
    const index = variationThumbnails.findIndex((img) => img.flavorId === id);
    if (index >= 0) setActiveIndex(index);
  };

  // Selecionar MINIATURA (por índice): identifica o sabor daquela imagem, seleciona-o
  // e mostra a imagem — sincronizando toda a interface (SKU, descrição, tabela, ficha…).
  const selectThumbnail = (index: number): void => {
    setActiveIndex(index);
    const flavorId = variationThumbnails[index]?.flavorId;
    if (flavorId) setSelectedId(flavorId);
  };

  // Imagem principal exibida (grande).
  const mainImage = hasVariations
    ? (variationThumbnails[activeIndex] ?? variationThumbnails[0] ?? null)
    : (product.images[0] ?? null);

  const sku = selected?.sku ?? product.sku;
  const weight = selected?.weight ?? product.weight;
  const nutrition = selected?.nutrition ?? product.nutrition;
  const technicalSheetUrl = selected?.technicalSheetUrl ?? product.technicalSheetUrl;
  const descriptionHtml = hasVariations ? selected!.descriptionHtml : product.descriptionHtml;
  const available = hasVariations ? (selected?.available ?? false) : true;

  // Especificações objetivas e enxutas: SKU (quando houver), Peso (quando houver)
  // e Unidade de venda. Não repete fornecedor/categoria (já no cabeçalho/breadcrumb).
  const specs = [
    { label: "Código (SKU)", value: sku ?? "" },
    { label: "Peso", value: weight ?? "" },
    { label: "Unidade de venda", value: product.saleUnit },
  ];

  // Blocos de conteúdo (descrição reativa + campos do produto). Só os preenchidos.
  // Ordem: Descrição → Composição → Modo de preparo → Conservação → Aplicação.
  const contentSections = [
    { title: "Descrição do produto", html: descriptionHtml },
    { title: "Composição", html: product.compositionHtml },
    { title: "Modo de preparo", html: product.preparationHtml },
    { title: "Conservação", html: product.conservationHtml },
    { title: "Modo de aplicação", html: product.applicationHtml },
  ].filter((section) => section.html.trim() !== "");

  const hasDocuments = Boolean(nutrition) || Boolean(technicalSheetUrl);

  const descriptionColumn = (
    <div className="space-y-8">
      {contentSections.map((section) => (
        <RichHtmlSection key={section.title} title={section.title} html={section.html} />
      ))}
    </div>
  );

  const documentsColumn = (
    <aside className="space-y-8">
      {nutrition && (
        <NutritionSection data={nutrition} variationName={hasVariations ? selected?.name : null} />
      )}
      {technicalSheetUrl && <TechnicalSheetSection url={technicalSheetUrl} label={product.name} />}
    </aside>
  );

  return (
    <div className="space-y-10">
      {/* TOPO: galeria (tira vertical + imagem principal) | cabeçalho + sabores + CTA + specs */}
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-12">
        <div className="min-w-0">
          {/* Galeria controlada: com variações, a tira mostra TODAS as imagens de
              TODAS as variações desde o carregamento; clicar numa miniatura
              seleciona o sabor dela. Sem variações, só a imagem principal. */}
          <ProductGallery
            mainImage={mainImage}
            thumbnails={hasVariations ? variationThumbnails : []}
            activeIndex={activeIndex}
            onSelect={selectThumbnail}
            name={product.name}
          />
        </div>

        <div className="min-w-0 space-y-6">
          {/* Ordem: Título → Fornecedor → SKU → (resumo) → Sabores → Quantidade+Botão → Especificações → Benefícios */}
          <div className="space-y-3">
            <h1 className="font-display text-3xl leading-[1.12] font-extrabold tracking-tight text-balance sm:text-4xl">
              {product.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {product.supplierName && (
                <span className="text-primary text-sm font-semibold tracking-wide uppercase">
                  {product.supplierName}
                </span>
              )}
              {sku && (
                <span className="border-border text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs font-medium">
                  Cód. {sku}
                </span>
              )}
            </div>
            {product.shortDescription && (
              <p className="text-muted-foreground text-base leading-relaxed">
                {product.shortDescription}
              </p>
            )}
          </div>

          {hasVariations && (
            <VariationButtons
              variations={variations}
              selectedId={selected?.id ?? ""}
              onSelect={selectFlavor}
              productId={product.id}
            />
          )}

          <QuoteCta
            productId={product.id}
            slug={product.slug}
            name={product.name}
            unit={product.saleUnit}
            imageUrl={mainImage?.url ?? null}
            flavorId={hasVariations ? (selected?.id ?? null) : null}
            flavorName={hasVariations ? (selected?.name ?? null) : null}
            available={available}
          />

          <ProductSpecs specs={specs} />

          <ProductHighlights items={product.highlights} />
        </div>
      </div>

      {/* CONTEÚDO: descrição | documentos (adaptativo). Sem documentos, a
          descrição ocupa a largura de leitura. Espaço acima reduzido para dar
          continuidade de leitura (evita grande vazio entre o bloco do produto e
          a descrição). */}
      {contentSections.length > 0 &&
        (hasDocuments ? (
          <div className="border-border grid items-start gap-8 border-t pt-8 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)] lg:gap-10">
            {descriptionColumn}
            {documentsColumn}
          </div>
        ) : (
          <div className="border-border max-w-3xl border-t pt-8">{descriptionColumn}</div>
        ))}
    </div>
  );
}

/**
 * Seletor de variação por BOTÕES (nome do sabor), no mesmo estilo dos chips de
 * categoria do catálogo — sem miniaturas competindo com a imagem principal.
 * Clicar troca a variação (a página reage). Marca as que já estão na cotação (✓)
 * e esmaece as indisponíveis. Quebra em linhas quando há muitas.
 */
function VariationButtons({
  variations,
  selectedId,
  onSelect,
  productId,
}: {
  readonly variations: readonly DetailVariation[];
  readonly selectedId: string;
  readonly onSelect: (id: string) => void;
  readonly productId: string;
}): React.ReactElement {
  const { isInCart } = useQuoteCart();

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold">
        Escolha o sabor
        <span className="text-muted-foreground font-normal"> · {variations.length} opções</span>
      </p>
      <ul className="flex flex-wrap gap-2.5">
        {variations.map((variation) => {
          const isSelected = variation.id === selectedId;
          const inCart = isInCart(productId, variation.id);
          return (
            <li key={variation.id}>
              <button
                type="button"
                onClick={() => onSelect(variation.id)}
                aria-pressed={isSelected}
                aria-label={`Escolher sabor ${variation.name}`}
                className={cn(
                  "focus-visible:ring-primary/50 inline-flex min-h-11 items-center gap-1.5 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none active:scale-[0.97]",
                  isSelected
                    ? "border-primary bg-accent text-primary ring-primary/40 shadow-soft ring-1"
                    : "border-border text-foreground hover:border-primary/40 hover:bg-accent hover:shadow-soft",
                  !variation.available && "opacity-50",
                )}
              >
                {inCart && <Check className="text-brand size-4" aria-label="Na cotação" />}
                {variation.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Bloco único de cotação: quantidade + adicionar (reativo à variação selecionada). */
function QuoteCta({
  productId,
  slug,
  name,
  unit,
  imageUrl,
  flavorId,
  flavorName,
  available,
}: {
  readonly productId: string;
  readonly slug: string;
  readonly name: string;
  readonly unit: string;
  readonly imageUrl: string | null;
  readonly flavorId: string | null;
  readonly flavorName: string | null;
  readonly available: boolean;
}): React.ReactElement {
  const { items, addItem, setQuantity, removeItem } = useQuoteCart();
  const [quantity, setQuantity_] = useState(1);

  const cartItem = items.find(
    (item) => item.productId === productId && (item.flavorId ?? null) === flavorId,
  );

  const label = flavorName ? `${name} — ${flavorName}` : name;

  if (!available) {
    return (
      <div className="border-border bg-muted/40 text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-sm">
        Esta variação está <span className="text-foreground font-medium">indisponível</span> no
        momento. Selecione outra ou fale com nosso time.
      </div>
    );
  }

  if (cartItem) {
    return (
      <div className="border-border space-y-3 border-t pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <QuantityStepper
            value={cartItem.quantity}
            onChange={(next) => setQuantity(productId, flavorId, next)}
            onRemove={() => removeItem(productId, flavorId)}
            label={`Quantidade de ${label} na cotação`}
            size="lg"
          />
          <span className="text-muted-foreground text-sm">{unit}</span>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-border text-foreground hover:bg-muted hover:text-foreground w-full rounded-full transition-all duration-200 active:scale-[0.98] sm:w-auto"
          >
            <Link href={ROUTES.quote}>
              <ClipboardList />
              Ver minha cotação
            </Link>
          </Button>
        </div>
        <p className="text-foreground inline-flex items-center gap-2 text-sm font-medium">
          <Check className="size-4 text-green-600" aria-hidden="true" />
          Na sua cotação
        </p>
      </div>
    );
  }

  return (
    <div className="border-border flex flex-wrap items-center gap-4 border-t pt-6">
      <QuantityStepper
        value={quantity}
        onChange={setQuantity_}
        label={`Quantidade de ${label}`}
        size="lg"
      />
      <span className="text-muted-foreground text-sm">{unit}</span>
      <Button
        size="lg"
        onClick={() =>
          addItem({ productId, slug, name, imageUrl, flavorId, flavorName, unit }, quantity)
        }
        className="bg-brand text-brand-foreground hover:bg-brand/90 hover:shadow-brand/30 w-full rounded-full font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] sm:w-auto"
      >
        <ClipboardList />
        Adicionar à cotação
      </Button>
    </div>
  );
}
