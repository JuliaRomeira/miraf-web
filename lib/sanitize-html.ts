import sanitizeHtml from "sanitize-html";

/**
 * Sanitização de HTML rico (descrição de produto vinda do editor WYSIWYG).
 *
 * ⚠️ Server-only: `sanitize-html` depende de APIs de Node — importe apenas em
 * Server Components / Route Handlers / Server Actions, nunca em `"use client"`.
 *
 * O editor (TipTap) é usado só por administradores autenticados, mas ainda assim
 * sanitizamos na renderização (defesa na saída): garante que só um conjunto
 * seguro de tags/atributos/estilos chegue ao `dangerouslySetInnerHTML`, mesmo
 * que o dado no banco seja adulterado.
 */

/** Cores aceitas em `color` / `background-color` (hex, rgb/rgba ou nome CSS). */
const COLOR_PATTERNS = [
  /^#(?:[0-9a-fA-F]{3,8})$/,
  /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,
  /^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)$/,
  /^[a-zA-Z]+$/,
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "span",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "h1",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    "*": ["style"],
  },
  allowedStyles: {
    "*": {
      color: COLOR_PATTERNS,
      "background-color": COLOR_PATTERNS,
      "font-size": [/^\d+(?:\.\d+)?(?:px|rem|em|%)$/],
      "text-align": [/^(?:left|right|center|justify)$/],
    },
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  transformTags: {
    // Links externos abrem em nova aba e sem vazar o referer/opener.
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
    // Rebaixa títulos autorais (o editor expõe H1–H3) para h3, para que a
    // descrição do produto nunca crie um segundo h1/h2 e quebre a hierarquia.
    h1: "h3",
    h2: "h3",
  },
};

/** Escapa texto puro para uso seguro dentro de HTML. */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Converte texto puro (descrições legadas) em parágrafos, preservando quebras. */
function plainTextToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

/**
 * Prepara a descrição de um produto para render seguro.
 * - HTML (novo, do editor) → sanitizado contra a allowlist acima.
 * - Texto puro (legado, sem tags) → escapado e quebrado em parágrafos.
 */
export function renderRichText(value: string): string {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(trimmed);
  return looksLikeHtml ? sanitizeHtml(trimmed, SANITIZE_OPTIONS) : plainTextToHtml(trimmed);
}
