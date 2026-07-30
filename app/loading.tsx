/**
 * Loading UI global.
 * Exibida enquanto o Next.js resolve componentes Server e streams o HTML.
 */
export default function Loading(): React.ReactElement {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-1 items-center justify-center px-6 py-24"
    >
      <div className="border-muted-foreground/30 border-t-foreground h-8 w-8 animate-spin rounded-full border-2" />
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
