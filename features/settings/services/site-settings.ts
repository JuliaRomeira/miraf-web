import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

/**
 * Configurações do site EDITÁVEIS pelo painel (model `Settings`).
 *
 * Escopo (decisão da cliente): só contato, redes sociais e e-mails de cotação
 * são editáveis. Nome, descrição e textos do hero ficam no código
 * (`SITE_CONFIG`), pois mudam raramente.
 */

/** Cache tag usado por `getSiteSettings` — revalidar após salvar Configurações. */
export const SITE_SETTINGS_TAG = "site-settings";

/** Chaves de `Settings` editáveis pelo painel de Configurações. */
export const SETTINGS_KEYS = [
  "contact_email",
  "contact_phone",
  "contact_whatsapp",
  "address",
  "instagram",
  "facebook",
  "quote_email_recipient",
  "quote_email_cc",
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

export interface SiteSettings {
  contactEmail: string;
  contactPhone: string;
  contactWhatsapp: string;
  address: string;
  instagram: string;
  facebook: string;
  quoteEmailRecipient: string;
  quoteEmailCc: string;
}

async function loadSiteSettings(): Promise<SiteSettings> {
  const rows = await prisma.settings.findMany({
    where: { key: { in: [...SETTINGS_KEYS] } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((row) => [row.key, row.value]));
  const get = (key: SettingsKey): string => map.get(key) ?? "";

  return {
    contactEmail: get("contact_email"),
    contactPhone: get("contact_phone"),
    contactWhatsapp: get("contact_whatsapp"),
    address: get("address"),
    instagram: get("instagram"),
    facebook: get("facebook"),
    quoteEmailRecipient: get("quote_email_recipient"),
    quoteEmailCc: get("quote_email_cc"),
  };
}

/**
 * Lê as configurações editáveis do site com cache de dados do Next.js.
 * O painel de Configurações chama `revalidateTag(SITE_SETTINGS_TAG)` ao salvar
 * para refletir as alterações imediatamente.
 */
export const getSiteSettings = unstable_cache(loadSiteSettings, [SITE_SETTINGS_TAG], {
  tags: [SITE_SETTINGS_TAG],
  revalidate: 3600,
});

/**
 * Lê os valores brutos para preencher o formulário do admin — sem cache,
 * refletindo o valor real gravado (ou string vazia).
 */
export async function getEditableSettings(): Promise<Record<SettingsKey, string>> {
  const rows = await prisma.settings.findMany({
    where: { key: { in: [...SETTINGS_KEYS] } },
    select: { key: true, value: true },
  });
  const map = new Map(rows.map((row) => [row.key, row.value]));

  const result = {} as Record<SettingsKey, string>;
  for (const key of SETTINGS_KEYS) {
    result[key] = map.get(key) ?? "";
  }
  return result;
}

/** Salva (upsert) as configurações editáveis em uma transação. */
export async function updateSettings(values: Record<SettingsKey, string>): Promise<void> {
  await prisma.$transaction(
    SETTINGS_KEYS.map((key) =>
      prisma.settings.upsert({
        where: { key },
        update: { value: values[key] },
        create: { key, value: values[key] },
      }),
    ),
  );
}
