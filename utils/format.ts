/**
 * Formatação de valores para exibição.
 *
 * Todas as funções são puras e determinísticas.
 * Nunca colocar lógica de negócio aqui — apenas formatação.
 */

const CPF_REGEX = /^(\d{3})(\d{3})(\d{3})(\d{2})$/;
const CNPJ_REGEX = /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/;
const PHONE_10_REGEX = /^(\d{2})(\d{4})(\d{4})$/;
const PHONE_11_REGEX = /^(\d{2})(\d{5})(\d{4})$/;

/** Remove todos os caracteres não numéricos de uma string. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Formata um CPF (11 dígitos) como "000.000.000-00". Retorna o input original se inválido. */
export function formatCPF(value: string): string {
  const digits = onlyDigits(value);
  return digits.replace(CPF_REGEX, "$1.$2.$3-$4");
}

/** Formata um CNPJ (14 dígitos) como "00.000.000/0000-00". Retorna o input original se inválido. */
export function formatCNPJ(value: string): string {
  const digits = onlyDigits(value);
  return digits.replace(CNPJ_REGEX, "$1.$2.$3/$4-$5");
}

/** Formata automaticamente como CPF ou CNPJ conforme a quantidade de dígitos. */
export function formatCpfCnpj(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 11) return formatCPF(digits);
  if (digits.length === 14) return formatCNPJ(digits);
  return value;
}

/** Formata telefone brasileiro: "(00) 0000-0000" ou "(00) 00000-0000". */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value);
  if (digits.length === 11) return digits.replace(PHONE_11_REGEX, "($1) $2-$3");
  if (digits.length === 10) return digits.replace(PHONE_10_REGEX, "($1) $2-$3");
  return value;
}
