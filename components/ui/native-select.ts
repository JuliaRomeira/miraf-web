/**
 * Classe padrão para `<select>` nativos do painel administrativo. Alinha altura
 * (h-10), raio, foco (ring-2 + offset) e estados ao componente `Input`, para que
 * todos os campos do painel tenham a mesma aparência (o painel tinha 3 estilos de
 * select diferentes). Use em qualquer `<select>` cru do admin.
 */
export const nativeSelectClass =
  "border-input ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";
