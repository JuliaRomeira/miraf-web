import { z } from "zod";

/**
 * Schema de validação das variáveis de ambiente.
 *
 * Todas as variáveis são validadas na inicialização do processo (server-side).
 * Se alguma faltar ou tiver tipo/formato inválido, o processo falha imediatamente
 * com uma mensagem clara — evitando bugs silenciosos em produção.
 *
 * Variáveis públicas (expostas ao browser) DEVEM começar com NEXT_PUBLIC_
 * e ser referenciadas em client components apenas via `env.NEXT_PUBLIC_*`.
 *
 * Uso:
 *   import { env } from "@/lib/env";
 *   const dbUrl = env.DATABASE_URL;
 */

const envSchema = z.object({
  // App
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Database
  DATABASE_URL: z.string().url().min(1, "DATABASE_URL é obrigatória"),

  // Auth.js
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET deve ter no mínimo 32 caracteres"),
  AUTH_URL: z.string().url().optional(),
  AUTH_TRUST_HOST: z
    .string()
    .optional()
    .transform((value) => value === "true"),

  // Resend (opcional; a feature de cotação degrada graciosamente sem estes valores)
  RESEND_API_KEY: z.string().optional(),
  // Aceita e-mail puro ("cotacao@dominio.com") ou com nome de exibição
  // ("Mira <cotacao@dominio.com>") — formato válido do Resend documentado no
  // .env.example. Vazio = envio de e-mail desativado.
  RESEND_FROM_EMAIL: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ||
        /<[^@\s]+@[^@\s]+\.[^@\s]+>/.test(value),
      "RESEND_FROM_EMAIL deve ser um e-mail ou 'Nome <email>'.",
    ),
  QUOTE_RECIPIENT_EMAIL: z.string().email().optional().or(z.literal("")),

  // SMTP (opcional) — envio de cotações pelo e-mail da própria empresa
  // (ex.: Google Workspace). Quando SMTP_HOST/USER/PASSWORD estão definidos,
  // tem PRIORIDADE sobre o Resend. Vazio = usa Resend (ou desativa o e-mail).
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  // Remetente exibido. Aceita e-mail puro ou "Nome <email>". Vazio = usa SMTP_USER.
  SMTP_FROM: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value ||
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ||
        /<[^@\s]+@[^@\s]+\.[^@\s]+>/.test(value),
      "SMTP_FROM deve ser um e-mail ou 'Nome <email>'.",
    ),
});

/**
 * Fonte das variáveis. Precisa ser explícita porque o Next.js só inclui
 * variáveis referenciadas literalmente por `process.env.<NOME>` no bundle.
 */
const parsedEnv = envSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  AUTH_URL: process.env.AUTH_URL,
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  QUOTE_RECIPIENT_EMAIL: process.env.QUOTE_RECIPIENT_EMAIL,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  SMTP_FROM: process.env.SMTP_FROM,
});

if (!parsedEnv.success) {
  console.error(
    "❌ Variáveis de ambiente inválidas:",
    JSON.stringify(z.treeifyError(parsedEnv.error), null, 2),
  );
  throw new Error("Variáveis de ambiente inválidas. Verifique o arquivo .env.");
}

export const env = parsedEnv.data;
export type Env = z.infer<typeof envSchema>;
