import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { WhatsAppFloat } from "@/components/layout/whatsapp-float";
import { QuoteCartProvider } from "@/features/quote/store/quote-cart-context";
import { getSiteSettings } from "@/features/settings/services/site-settings";
import { SITE_CONFIG } from "@/constants";

/**
 * Layout do site público: cabeçalho fixo, conteúdo da página, rodapé
 * institucional e botão flutuante de WhatsApp.
 *
 * Envolve tudo no `QuoteCartProvider` para que o carrinho de cotação (estado
 * no cliente + localStorage) fique disponível ao cabeçalho, às páginas de
 * produto e à página "Minha cotação".
 *
 * Acessibilidade: um link "pular para o conteúdo" (visível só no foco) permite
 * saltar o cabeçalho repetido, e o conteúdo fica em um landmark `<main>`.
 * SEO: emite o JSON-LD (Schema.org) da Organização, com contato/redes vindos
 * das Configurações editáveis.
 */
interface PublicLayoutProps {
  readonly children: React.ReactNode;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function PublicLayout({
  children,
}: PublicLayoutProps): Promise<React.ReactElement> {
  const settings = await getSiteSettings();
  const sameAs = [settings.instagram, settings.facebook].filter((url) => url !== "");

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.fullName,
    url: APP_URL,
    logo: `${APP_URL}/logo-mira.png`,
    description: SITE_CONFIG.description,
    ...(settings.contactPhone || settings.contactEmail
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "sales",
            ...(settings.contactPhone ? { telephone: settings.contactPhone } : {}),
            ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
            areaServed: "BR",
            availableLanguage: "Portuguese",
          },
        }
      : {}),
    ...(settings.address
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings.address,
            addressCountry: "BR",
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };

  return (
    <QuoteCartProvider>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <a
        href="#conteudo"
        className="focus-visible:ring-ring focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:shadow-lg focus:outline-none focus-visible:ring-2"
      >
        Pular para o conteúdo
      </a>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        <main id="conteudo" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
        <WhatsAppFloat />
      </div>
    </QuoteCartProvider>
  );
}
