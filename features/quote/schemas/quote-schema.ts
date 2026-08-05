import { z } from "zod";

import { isValidCNPJ, isValidCPF } from "@/utils/document";
import { onlyDigits } from "@/utils/format";

/**
 * Validação e sanitização da solicitação de cotação (server-side).
 *
 * Decisões (Sessão 03):
 *  - `document` e `phone` são sanitizados (só dígitos) ANTES de validar.
 *  - CPF/CNPJ validados por dígito verificador (não apenas tamanho).
 *  - O tipo do documento (CPF|CNPJ) é derivado do nº de dígitos — um único
 *    campo no formulário, menos cliques para o usuário.
 *  - Os itens carregam apenas `productId` + `quantity`; o service revalida os
 *    produtos no banco (nunca confiar em nome/estado vindos do cliente).
 */

const MAX_QUANTITY = 9999;

export const quoteItemSchema = z.object({
  productId: z.string().min(1, "Produto inválido."),
  /** Sabor escolhido (id). `null` = produto sem sabor. Resolvido no service. */
  flavorId: z
    .string()
    .trim()
    .min(1)
    .nullable()
    .optional()
    .transform((value) => value ?? null),
  quantity: z.coerce
    .number({ error: "Quantidade inválida." })
    .int("Quantidade inválida.")
    .min(1, "A quantidade mínima é 1.")
    .max(MAX_QUANTITY, `A quantidade máxima é ${MAX_QUANTITY}.`),
});

export const quoteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe seu nome ou o da empresa.")
      .max(120, "Nome muito longo."),
    document: z
      .string()
      .trim()
      .transform(onlyDigits)
      .refine((value) => value.length === 11 || value.length === 14, "Informe um CPF ou CNPJ."),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu e-mail.")
      .max(180, "E-mail muito longo.")
      .email("E-mail inválido."),
    phone: z
      .string()
      .trim()
      .transform(onlyDigits)
      .refine(
        (value) => value.length === 10 || value.length === 11,
        "Informe um telefone válido com DDD.",
      ),
    notes: z
      .string()
      .trim()
      .max(1000, "Observações muito longas.")
      .optional()
      .transform((value) => (value ? value : undefined)),
    items: z.array(quoteItemSchema).min(1, "Adicione ao menos um produto à cotação."),
  })
  .superRefine((data, ctx) => {
    const isCpf = data.document.length === 11;
    const valid = isCpf ? isValidCPF(data.document) : isValidCNPJ(data.document);
    if (!valid) {
      ctx.addIssue({
        code: "custom",
        path: ["document"],
        message: isCpf ? "CPF inválido." : "CNPJ inválido.",
      });
    }
  })
  .transform((data) => ({
    ...data,
    documentType: data.document.length === 11 ? ("CPF" as const) : ("CNPJ" as const),
  }));

/** Entrada validada e sanitizada, com `documentType` derivado. */
export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteItemInput = z.infer<typeof quoteItemSchema>;
