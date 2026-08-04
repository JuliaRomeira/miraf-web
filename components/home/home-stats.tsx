import { History, Package, Store, Users, type LucideIcon } from "lucide-react";

interface HomeStat {
  readonly icon: LucideIcon;
  readonly value: string;
  readonly label: string;
}

/**
 * Números institucionais na home (prova social).
 * Usa a mesma fonte do corpo do site (Public Sans, via `--font-sans`): valores
 * em negrito e rótulos em maiúsculo espaçado, centralizados sobre o azul da marca.
 *
 * NOTA: alguns valores são estimativas a confirmar com a cliente (ver
 * pendências). "+40 anos" e "3 unidades" são dados reais (fundada em 1982; três
 * unidades listadas em /nossas-unidades).
 */
const HOME_STATS: readonly HomeStat[] = [
  { icon: History, value: "+40", label: "Anos de experiência" },
  { icon: Users, value: "+9 mil", label: "Clientes atendidos" },
  { icon: Store, value: "3", label: "Unidades de distribuição" },
  { icon: Package, value: "+2.500", label: "Itens em catálogo" },
];

export function HomeStats(): React.ReactElement {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:py-10">
      <div className="bg-primary text-primary-foreground rounded-[22px] px-6 py-11 sm:px-8 lg:px-[46px]">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-8 lg:flex lg:items-center lg:justify-between">
          {HOME_STATS.map(({ value, label }, index) => (
            <div key={label} className="flex items-center lg:flex-1">
              <div className="flex-1 text-center">
                <dd className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-[40px]">
                  {value}
                </dd>
                <dt className="text-primary-foreground/60 mt-2.5 text-[10.5px] font-medium tracking-[0.15em] uppercase">
                  {label}
                </dt>
              </div>
              {index < HOME_STATS.length - 1 && (
                <span className="hidden h-13 w-px bg-white/20 lg:block" aria-hidden />
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
