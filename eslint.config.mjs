import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import eslintConfigPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/**
 * Config do ESLint (formato flat).
 *
 * Consome `eslint-config-next` (legacy) via FlatCompat, e desativa regras
 * conflitantes com o Prettier via `eslint-config-prettier`.
 */
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  eslintConfigPrettier,
  {
    rules: {
      // Nunca permitir `any` explícito
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Força uso de `import type` para tipos (bundle menor)
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      // Bloqueia console.log em produção (permite console.warn/error)
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Boas práticas de React
      "react/self-closing-comp": "error",
      "react/jsx-boolean-value": ["error", "never"],
      // Evita duplicação de imports
      "no-duplicate-imports": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "coverage/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
