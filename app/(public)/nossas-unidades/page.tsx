import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { UnitCard } from "@/components/institutional/unit-card";
import { COMPANY_UNITS, ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Nossas Unidades",
  description:
    "Três centros de distribuição no interior de São Paulo — São João da Boa Vista, Ribeirão Preto e São José do Rio Preto — com cobertura em mais de 500 municípios.",
  alternates: { canonical: ROUTES.units },
};

/**
 * Página "Nossas Unidades" (`/unidades`) — direção Moderno. Cabeçalho
 * centralizado, grade de cards (a matriz em destaque) e faixa de cobertura em
 * azul-claro com CTA. Dados em `constants/units.ts` (COMPANY_UNITS).
 */
export default function UnitsPage(): React.ReactElement {
  const units = [...COMPANY_UNITS].sort((a, b) =>
    a.type === b.type ? 0 : a.type === "Matriz" ? -1 : 1,
  );

  return (
    <>
      {/* Cabeçalho */}
      <section className="mx-auto max-w-3xl px-6 pt-16 pb-4 text-center lg:pt-20">
        <p className="text-brand mb-3 font-mono text-xs tracking-[0.2em] uppercase">Onde estamos</p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
          Nossas unidades
        </h1>
        <p className="text-muted-foreground mt-3 text-base leading-relaxed">
          Três centros de distribuição estrategicamente localizados no interior de São Paulo,
          garantindo cobertura regional e entregas ágeis.
        </p>
      </section>

      {/* Cards */}
      <section className="mx-auto max-w-6xl px-6 py-9">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </section>

      {/* Faixa de cobertura */}
      <section className="mx-auto max-w-6xl px-6 pb-16 lg:pb-20">
        <div className="bg-accent/50 border-border flex flex-col items-start gap-6 rounded-[18px] border p-8 lg:flex-row lg:items-center lg:p-9">
          <dl className="flex flex-1 flex-wrap gap-x-9 gap-y-4">
            <div>
              <dd className="font-display text-primary text-2xl font-extrabold tracking-tight sm:text-[28px]">
                +500
              </dd>
              <dt className="text-muted-foreground mt-1 text-sm">municípios atendidos</dt>
            </div>
            <div>
              <dd className="font-display text-primary text-2xl font-extrabold tracking-tight sm:text-[28px]">
                Interior de SP
              </dd>
              <dt className="text-muted-foreground mt-1 text-sm">cobertura em todo o estado</dt>
            </div>
            <div>
              <dd className="font-display text-primary text-2xl font-extrabold tracking-tight sm:text-[28px]">
                Frota própria
              </dd>
              <dt className="text-muted-foreground mt-1 text-sm">entregas rápidas e confiáveis</dt>
            </div>
          </dl>
          <Button
            asChild
            size="lg"
            className="bg-brand text-brand-foreground hover:bg-brand/90 shrink-0 rounded-full"
          >
            <Link href={ROUTES.products}>Solicitar cotação</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
