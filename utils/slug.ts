/**
 * Converte uma string em um slug URL-friendly.
 *
 * @example
 * slugify("Farinha de Trigo — 5kg")  // "farinha-de-trigo-5kg"
 * slugify("Açúcar Refinado")         // "acucar-refinado"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove caracteres não alfanuméricos
    .replace(/[\s_-]+/g, "-") // colapsa separadores em hífen
    .replace(/^-+|-+$/g, ""); // remove hífens das bordas
}
