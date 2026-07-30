import { z } from "zod";

/**
 * Validação das configurações editáveis do site (model `Settings`).
 * Todos os campos são opcionais — o admin pode limpar um valor. Campos de
 * e-mail/URL só validam quando preenchidos.
 */

const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`).optional();

const optionalEmail = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => value === undefined || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value),
    "E-mail inválido.",
  );

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => value === undefined || /^https?:\/\/.+/i.test(value),
    "Informe uma URL válida (http/https).",
  );

export const settingsSchema = z.object({
  contact_email: optionalEmail,
  contact_phone: optionalText(40),
  contact_whatsapp: optionalText(40),
  address: optionalText(300),
  instagram: optionalUrl,
  facebook: optionalUrl,
  quote_email_recipient: optionalEmail,
  quote_email_cc: optionalEmail,
});

export type SettingsInput = z.infer<typeof settingsSchema>;
