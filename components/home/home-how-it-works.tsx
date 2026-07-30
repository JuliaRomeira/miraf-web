import { ClipboardList, ListChecks, Send, type LucideIcon } from "lucide-react";

interface Step {
  readonly icon: LucideIcon;
  readonly n: string;
  readonly title: string;
  readonly description: string;
}

const STEPS: readonly Step[] = [
  {
    icon: ListChecks,
    n: "1",
    title: "Monte a lista",
    description: "Adicione produtos à sua cotação enquanto navega pelo catálogo.",
  },
  {
    icon: Send,
    n: "2",
    title: "Envie o pedido",
    description: "Preencha seus dados e envie a solicitação em um clique.",
  },
  {
    icon: ClipboardList,
    n: "3",
    title: "Receba a proposta",
    description: "O time comercial retorna com as condições para o seu volume.",
  },
];

/**
 * Seção "Como funciona a cotação" — explica o fluxo de conversão do site em
 * três passos, logo após os segmentos.
 */
export function HomeHowItWorks(): React.ReactElement {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
      <div className="bg-accent/50 border-border rounded-3xl border p-8 lg:p-14">
        <header className="mb-10 lg:mb-12">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
            Como funciona a cotação
          </h2>
          <p className="text-muted-foreground mt-3 text-lg">
            Do catálogo à proposta comercial, sem burocracia.
          </p>
        </header>
        <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, n, title, description }) => (
            <li key={n} className="flex flex-col gap-3">
              <div className="bg-primary text-primary-foreground font-display flex size-12 items-center justify-center rounded-2xl text-xl font-extrabold">
                {n}
              </div>
              <div className="flex items-center gap-2">
                <Icon className="text-primary size-6" />
                <p className="text-xl font-semibold tracking-tight">{title}</p>
              </div>
              <p className="text-muted-foreground text-base leading-relaxed">{description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
