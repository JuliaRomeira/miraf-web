import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

import { getSiteSettings } from "@/features/settings/services/site-settings";
import { onlyDigits } from "@/utils";
import { PUBLIC_NAV_ITEMS } from "@/constants/navigation";
import { ROUTES, SITE_CONFIG } from "@/constants";

/**
 * Rodapé institucional do site público (fundo escuro, na direção da referência
 * de UX — mantendo a identidade da Mira com a faixa vermelha no topo).
 *
 * Server Component: contato e redes sociais vêm das configurações editáveis
 * (model `Settings`); nome e descrição vêm do código (`SITE_CONFIG`).
 *
 * Sobre o logo: no fundo escuro usamos o logo em branco (filtro
 * `brightness-0 invert` sobre o PNG oficial), já que ainda não há um asset
 * `logo-mira-dark.png` dedicado.
 *
 * Cores: fundo em azul escuro da marca (`#0e2c62`, um tom escurecido de
 * `#17479e` — o mesmo usado como base do hero) + brancos com opacidade e a
 * faixa vermelha (`--brand`, #ed1c24). Sem tons de slate/cinza-azulado.
 */
export async function SiteFooter(): Promise<React.ReactElement> {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  const socials = [
    { label: "Instagram", href: settings.instagram },
    { label: "Facebook", href: settings.facebook },
  ].filter((social) => social.href !== "");

  return (
    <footer className="bg-[#0e2c62] text-white/70">
      {/* Faixa fina da cor da marca */}
      <div className="bg-brand h-1 w-full" aria-hidden />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Marca + descrição institucional */}
          <div className="space-y-5 lg:col-span-5">
            <Link
              href={ROUTES.home}
              aria-label="Mira — página inicial"
              className="inline-flex focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0e2c62] focus-visible:outline-none"
            >
              <Image
                src="/logo-mira.png"
                alt="Mira"
                width={97}
                height={32}
                className="brightness-0 invert"
              />
            </Link>
            <p className="max-w-md text-sm leading-relaxed text-white/65">
              {SITE_CONFIG.footerTagline}
            </p>
            {socials.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {socials.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary inline-flex h-9 items-center rounded-full border border-white/25 px-4 text-sm font-medium text-white/80 transition-colors hover:border-white hover:bg-white"
                  >
                    {label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navegação */}
          <div className="space-y-4 lg:col-span-3">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-white uppercase">
              Navegação
            </h2>
            <ul className="space-y-2.5">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4 lg:col-span-4">
            <h2 className="text-xs font-semibold tracking-[0.12em] text-white uppercase">
              Contato
            </h2>
            <ul className="space-y-3 text-sm text-white/65">
              {settings.contactEmail && (
                <li>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <Mail className="size-5 shrink-0 text-white/45" />
                    {settings.contactEmail}
                  </a>
                </li>
              )}
              {settings.contactPhone && (
                <li>
                  <a
                    href={`tel:${onlyDigits(settings.contactPhone)}`}
                    className="flex items-center gap-3 transition-colors hover:text-white"
                  >
                    <Phone className="size-5 shrink-0 text-white/45" />
                    {settings.contactPhone}
                  </a>
                </li>
              )}
              {settings.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-white/45" />
                  <span>{settings.address}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-2 border-t border-white/15 pt-8 text-xs text-white/45 sm:flex-row">
          <p>
            © {year} {SITE_CONFIG.fullName}. Todos os direitos reservados.
          </p>
          <p>Desenvolvido por Júlia Romeira</p>
        </div>
      </div>
    </footer>
  );
}
