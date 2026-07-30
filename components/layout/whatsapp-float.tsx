import { MessageCircle } from "lucide-react";

import { getSiteSettings } from "@/features/settings/services/site-settings";
import { onlyDigits } from "@/utils";

/**
 * Botão flutuante de WhatsApp para contato rápido — canal de conversão
 * comum no B2B do segmento. Não renderiza nada se o número não estiver
 * configurado nas Settings.
 */
export async function WhatsAppFloat(): Promise<React.ReactElement | null> {
  const { contactWhatsapp } = await getSiteSettings();
  const digits = onlyDigits(contactWhatsapp);

  if (!digits) {
    return null;
  }

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="bg-primary text-primary-foreground fixed right-6 bottom-6 z-50 flex size-12 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
