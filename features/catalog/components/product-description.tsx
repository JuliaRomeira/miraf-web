import { renderRichText } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

interface ProductDescriptionProps {
  /** HTML rico (ou texto legado) da descrição do produto. */
  readonly html: string;
  /** Título da seção (ex.: "Descrição do produto", "Modo de preparo"). */
  readonly title?: string;
  readonly className?: string;
}

/**
 * Seção de conteúdo rico da página pública (descrição, modo de preparo…).
 * Renderiza o HTML do editor de forma segura — sanitizado no servidor antes de
 * ir para o `dangerouslySetInnerHTML` e estilizado pela classe `.rich-content`.
 */
export function ProductDescription({
  html,
  title = "Descrição do produto",
  className,
}: ProductDescriptionProps): React.ReactElement {
  return (
    <section className={className}>
      <h2 className="font-display mb-4 text-xl font-bold tracking-tight">{title}</h2>
      <div
        className={cn("rich-content")}
        dangerouslySetInnerHTML={{ __html: renderRichText(html) }}
      />
    </section>
  );
}
