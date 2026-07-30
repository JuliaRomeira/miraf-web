/**
 * Tipo genérico para o retorno de Server Actions.
 *
 * Padroniza o formato de resposta de todas as ações do servidor, permitindo
 * tratamento consistente de sucesso/erro no lado do cliente sem lançar exceções.
 *
 * @example
 * type Result = ActionResult<{ quoteId: string }>;
 *
 * // sucesso: { success: true, data: { quoteId: "abc" } }
 * // erro:    { success: false, error: "Mensagem", fieldErrors?: {...} }
 */
export type ActionResult<TData = void> =
  | {
      success: true;
      data: TData;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

export type ActionFailure = Extract<ActionResult, { success: false }>;
