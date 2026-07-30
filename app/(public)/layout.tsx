import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { QuoteCartProvider } from "@/features/quote/store/quote-cart-context";

/**
 * Layout do site público: cabeçalho fixo, conteúdo da página, rodapé
 * institucional e botão flutuante de WhatsApp.
 *
 * Envolve tudo no `QuoteCartProvider` para que o carrinho de cotação (estado
 * no cliente + localStorage) fique disponível ao cabeçalho, às páginas de
 * produto e à página "Minha cotação".
 */
interface PublicLayoutProps {
  readonly children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps): React.ReactElement {
  return (
    <QuoteCartProvider>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
        <WhatsAppFloat />
      </div>
    </QuoteCartProvider>
  );
}
