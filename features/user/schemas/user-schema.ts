import { z } from "zod";

/** Papéis atribuíveis a um usuário do painel. Espelha o enum `UserRole`. */
export const USER_ROLES = ["ADMIN", "EDITOR"] as const;

const nameField = z
  .string()
  .trim()
  .min(2, "Informe ao menos 2 caracteres.")
  .max(120, "Máximo de 120 caracteres.");

const emailField = z
  .string()
  .trim()
  .min(1, "Informe o e-mail.")
  .email("Informe um e-mail válido.")
  .max(160, "Máximo de 160 caracteres.");

const roleField = z.enum(USER_ROLES);

const activeField = z.boolean();

// bcrypt trunca senhas acima de 72 bytes — limitar aqui evita surpresas.
const passwordField = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .max(72, "Máximo de 72 caracteres.");

const baseUserSchema = z.object({
  name: nameField,
  email: emailField,
  role: roleField,
  active: activeField,
});

/** Criação exige senha. */
export const createUserSchema = baseUserSchema.extend({
  password: passwordField,
});

/** Na edição, a senha é opcional (em branco = manter a atual). */
export const updateUserSchema = baseUserSchema.extend({
  password: passwordField.optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
