import { z } from "zod";

/**
 * Schema de validação das credenciais do formulário de login do painel.
 * Reutilizado tanto pela Server Action (`loginAction`) quanto pelo
 * `authorize()` do Auth.js, que recebe os mesmos campos como `credentials`.
 */
export const loginSchema = z.object({
  email: z.string().min(1, "Informe o email.").email("Informe um email válido."),
  password: z.string().min(1, "Informe a senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;
