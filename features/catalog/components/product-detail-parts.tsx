import Link from "next/link";
import { CheckCircle2, Headset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

interface ProductSpec {
  readonly label: string;
  readonly value: string;
}

/**
 * Especificações objetivas do produto (Código/SKU, Peso, Unidade de venda) como
 * "information cards": rótulo pequeno em maiúsculas (azul da marca) sobre o valor
 * em destaque. Cards de mesmo tamanho, alinhados em grade, com borda e sombra
 * suave. Não repete fornecedor/categoria (já no cabeçalho/breadcrumb). Renderiza
 * só as specs com valor.
 */
export function ProductSpecs({ specs }: { readonly specs: readonly ProductSpec[] }) {
  const filled = specs.filter((spec) => spec.value.trim() !== "");
  if (filled.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-3">
      {filled.map((spec) => (
        <div
          key={spec.label}
          className="border-border/70 bg-card shadow-soft hover:border-primary/30 flex min-w-[7.5rem] flex-1 flex-col gap-1 rounded-xl border p-4 transition-colors duration-200"
        >
          <dt className="text-primary text-[11px] font-semibold tracking-wide uppercase">
            {spec.label}
          </dt>
          <dd className="text-foreground text-base leading-snug font-semibold break-words">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Destaques/benefícios do produto como "feature cards": grade de cartões com fundo
 * suave, borda, cantos arredondados, ícone azul alinhado e boa respiração interna.
 * Realce sutil no hover. Nada quando vazia.
 */
export function ProductHighlights({ items }: { readonly items: readonly string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="group border-border/70 bg-accent/40 text-foreground hover:border-primary/40 hover:bg-accent hover:shadow-soft flex items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-all duration-200"
        >
          <span className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <span className="leading-snug">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Faixa de ajuda ao fim da página de produto ("Falar com um consultor"). O botão
 * abre o WhatsApp quando há número configurado; senão leva à página de cotação
 * (objetivo do site). Estilo discreto (fundo suave, borda), alinhado à referência.
 */
export function ProductHelpCta({
  whatsappDigits,
}: {
  readonly whatsappDigits: string | null;
}): React.ReactElement {
  const href = whatsappDigits ? `https://wa.me/${whatsappDigits}` : ROUTES.quote;
  const external = Boolean(whatsappDigits);

  return (
    <div className="border-border/70 bg-accent/40 shadow-soft mt-12 flex flex-col items-start gap-5 rounded-2xl border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
      <div>
        <p className="font-display text-lg font-bold tracking-tight">
          Precisa de ajuda para escolher o produto ideal?
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          Fale com nosso time e receba orientação personalizada.
        </p>
      </div>
      <Button
        asChild
        size="lg"
        className="bg-brand text-brand-foreground hover:bg-brand/90 hover:shadow-brand/25 h-12 shrink-0 rounded-full px-6 font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
      >
        <Link
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
        >
          <Headset className="size-4" />
          Falar com um consultor
        </Link>
      </Button>
    </div>
  );
}
