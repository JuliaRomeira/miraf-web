import assert from "node:assert/strict";
import { test } from "node:test";

import { isValidCPF, isValidCNPJ } from "../utils/document";
import { formatCPF, formatCNPJ, formatPhone, onlyDigits } from "../utils/format";
import { quoteItemSchema } from "../features/quote/schemas/quote-schema";

test("CPF: valida dígitos verificadores e rejeita sequências", () => {
  assert.equal(isValidCPF("529.982.247-25"), true);
  assert.equal(isValidCPF("529.982.247-26"), false);
  assert.equal(isValidCPF("111.111.111-11"), false);
  assert.equal(isValidCPF("123"), false);
});

test("CNPJ: valida dígitos verificadores e rejeita sequências", () => {
  assert.equal(isValidCNPJ("04.252.011/0001-10"), true);
  assert.equal(isValidCNPJ("04.252.011/0001-11"), false);
  assert.equal(isValidCNPJ("00.000.000/0000-00"), false);
});

test("formatação: remove máscaras e apresenta CPF, CNPJ e telefone", () => {
  assert.equal(onlyDigits("(16) 99999-1234"), "16999991234");
  assert.equal(formatCPF("52998224725"), "529.982.247-25");
  assert.equal(formatCNPJ("04252011000110"), "04.252.011/0001-10");
  assert.equal(formatPhone("16999991234"), "(16) 99999-1234");
});

test("cotação: exige produto e quantidade positiva inteira, limitada a 9999", () => {
  assert.equal(quoteItemSchema.safeParse({ productId: "produto-1", quantity: "2" }).success, true);
  for (const quantity of [0, -1, 1.5, 10000]) {
    assert.equal(quoteItemSchema.safeParse({ productId: "produto-1", quantity }).success, false);
  }
  assert.equal(quoteItemSchema.safeParse({ productId: "", quantity: 1 }).success, false);
});
