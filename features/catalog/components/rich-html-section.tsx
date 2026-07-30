interface RichHtmlSectionProps {
  readonly title: string;
  /** HTML JÁ sanitizado no servidor (renderRichText). Vazio = não renderiza. */
  readonly html: string;
}

/**
 * Seção de conteúdo rico (descrição, composição, aplicação…) na página de
 * produto. Recebe HTML **já sanitizado no servidor** e o injeta com a classe
 * `.rich-content`. É client-safe (não importa `sanitize-html`), então pode
 * viver dentro do `ProductDetailView` (client) e trocar com a variação.
 */
export function RichHtmlSection({ title, html }: RichHtmlSectionProps): React.ReactElement | null {
  if (!html.trim()) return null;
  return (
    <section>
      {/* Título com marcador de acento (azul da marca) — dá ritmo e escaneabilidade
          entre os blocos (Descrição, Composição, Conservação…). */}
      <h2 className="font-display mb-3 flex items-center gap-2.5 text-xl font-bold tracking-tight">
        <span aria-hidden className="bg-primary h-5 w-1 shrink-0 rounded-full" />
        {title}
      </h2>
      <div
        className="rich-content text-[15px] sm:text-base"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  );
}
