import { z } from "zod";

/**
 * Schema de validação de um fornecedor. O `slug` é derivado do nome e garantido
 * único na camada de service. `logoUrl` aceita URL absoluta ou caminho local
 * (`/uploads/...`).
 */
export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres.")
    .max(100, "Máximo de 100 caracteres."),
  logoUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || /^https?:\/\//i.test(value) || value.startsWith("/"),
      "URL de logo inválida.",
    ),
  description: z.string().trim().max(500, "Máximo de 500 caracteres.").optional(),
  order: z
    .number()
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem não pode ser negativa."),
  active: z.boolean(),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
