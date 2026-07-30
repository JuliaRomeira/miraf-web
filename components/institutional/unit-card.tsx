import { Clock, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { onlyDigits } from "@/utils";
import type { CompanyUnit } from "@/constants";

interface UnitCardProps {
  readonly unit: CompanyUnit;
}

/**
 * Monta o link do Google Maps ("Ver no mapa") a partir do endereço da unidade.
 */
function buildMapUrl(unit: CompanyUnit): string {
  const destination = [unit.street, unit.district, `${unit.city} - ${unit.state}`, unit.zipCode]
    .filter(Boolean)
    .join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}

/**
 * Cartão de unidade (matriz ou filial) — direção Moderno. A matriz recebe um
 * destaque em azul da marca (borda + sombra); as filiais ficam neutras.
 */
export function UnitCard({ unit }: UnitCardProps): React.ReactElement {
  const isMatriz = unit.type === "Matriz";

  return (
    <article
      className={cn(
        "bg-card flex h-full flex-col gap-4 rounded-[18px] border p-6 transition-all duration-200 hover:-translate-y-1",
        isMatriz
          ? "border-primary/25 shadow-[0_20px_40px_-30px_rgba(23,71,158,0.5)]"
          : "border-border hover:shadow-lg",
      )}
    >
      <header className="flex flex-col gap-2.5">
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase",
            isMatriz ? "bg-accent text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {unit.type}
        </span>
        <h2 className="font-display text-xl font-bold tracking-tight text-balance">
          {unit.city} - {unit.state}
        </h2>
      </header>

      <address className="text-muted-foreground flex items-start gap-2 text-sm not-italic">
        <MapPin className="text-primary mt-0.5 size-4 shrink-0" />
        <span className="min-w-0 leading-relaxed break-words">
          {unit.street}
          {unit.district ? `, ${unit.district}` : ""}
          {unit.zipCode ? ` · CEP ${unit.zipCode}` : ""}
        </span>
      </address>

      <ul className="text-muted-foreground border-border/70 space-y-2.5 border-t pt-4 text-sm">
        {unit.phone && (
          <li>
            <a
              href={`tel:${onlyDigits(unit.phone)}`}
              className="hover:text-foreground flex items-center gap-2 transition-colors"
            >
              <Phone className="text-primary size-4 shrink-0" />
              {unit.phone}
            </a>
          </li>
        )}
        {unit.hours && (
          <li className="flex items-center gap-2">
            <Clock className="text-primary size-4 shrink-0" />
            {unit.hours}
          </li>
        )}
      </ul>

      <div className="mt-auto pt-1">
        <Button asChild className="w-full rounded-xl">
          <a
            href={buildMapUrl(unit)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Ver a unidade de ${unit.city} no Google Maps`}
          >
            <MapPin />
            Ver no mapa
          </a>
        </Button>
      </div>
    </article>
  );
}
