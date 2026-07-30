/**
 * Validação de CPF/CNPJ por dígito verificador (algoritmo oficial).
 *
 * Funções puras e determinísticas — recebem apenas dígitos (a máscara deve ser
 * removida antes, ex.: `onlyDigits`). Não colocar regra de negócio aqui.
 *
 * Rejeitam sequências de dígitos repetidos (ex.: "111.111.111-11"), que passam
 * na aritmética do verificador mas nunca são documentos reais.
 */

import { onlyDigits } from "@/utils/format";

/** Valida um CPF (11 dígitos) pelo dígito verificador. */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const checkDigit = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cpf[i]) * (length + 1 - i);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return checkDigit(9) === Number(cpf[9]) && checkDigit(10) === Number(cpf[10]);
}

/** Valida um CNPJ (14 dígitos) pelo dígito verificador. */
export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const checkDigit = (length: number): number => {
    // Pesos oficiais: 5,4,3,2,9,8,7,6,5,4,3,2 (a partir do fim do trecho).
    let sum = 0;
    let weight = length - 7;
    for (let i = 0; i < length; i += 1) {
      sum += Number(cnpj[i]) * weight;
      weight -= 1;
      if (weight < 2) weight = 9;
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  return checkDigit(12) === Number(cnpj[12]) && checkDigit(13) === Number(cnpj[13]);
}
