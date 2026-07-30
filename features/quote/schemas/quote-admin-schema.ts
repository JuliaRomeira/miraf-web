import { z } from "zod";

/**
 * Validação da gestão de cotações no painel (atualização de status e do
 * responsável pelo atendimento). O fluxo público de criação usa
 * `quote-schema.ts` — este é só para a aba Cotações do admin.
 */
export const updateQuoteSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  // Vazio = sem responsável atribuído.
  handledById: z
    .string()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
