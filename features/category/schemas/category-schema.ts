import { z } from "zod";

/**
 * Schema de validação de uma categoria.
 *
 * O `slug` NÃO é validado aqui — é derivado do nome e garantido único na
 * camada de service. Campos opcionais chegam como `undefined` quando vazios
 * (normalizados no Server Action a partir do FormData).
 */
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe ao menos 2 caracteres.")
    .max(100, "Máximo de 100 caracteres."),
  description: z.string().trim().max(500, "Máximo de 500 caracteres.").optional(),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || /^https?:\/\//i.test(value) || value.startsWith("/"),
      "Imagem inválida.",
    ),
  bannerUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => value === undefined || /^https?:\/\//i.test(value) || value.startsWith("/"),
      "Imagem inválida.",
    ),
  parentId: z.string().trim().min(1).optional(),
  order: z
    .number()
    .int("A ordem deve ser um número inteiro.")
    .min(0, "A ordem não pode ser negativa."),
  active: z.boolean(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
