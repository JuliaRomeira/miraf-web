import type { Metadata, Viewport } from "next";
import { Archivo, Geist_Mono, Public_Sans } from "next/font/google";

import { SITE_CONFIG } from "@/constants";

import "./globals.css";

/**
 * Tipografia da marca:
 *   - Public Sans  → corpo de texto (--font-public-sans, mapeado em --font-sans)
 *   - Archivo      → títulos/display (--font-archivo, utilitário `font-display`)
 *   - Geist Mono   → código/rótulos monoespaçados
 */
const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Metadata base do site. Cada rota pode sobrescrever/estender via seu próprio
 * `export const metadata` ou `generateMetadata`.
 *
 * `metadataBase` é obrigatório para URLs absolutas em Open Graph e sitemap.
 */
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  applicationName: SITE_CONFIG.fullName,
  authors: [{ name: SITE_CONFIG.name }],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    // Open Graph exige o formato com underscore (pt_BR); o `<html lang>` usa o
    // hífen (pt-BR). São padrões diferentes — não reutilizar SITE_CONFIG.locale aqui.
    locale: "pt_BR",
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: SITE_CONFIG.fullName }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: SITE_CONFIG.themeColor,
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.ReactElement {
  return (
    <html
      lang={SITE_CONFIG.locale}
      className={`${publicSans.variable} ${archivo.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-background text-foreground flex min-h-screen flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
