"use client";

import { useState } from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { START_TOUR_EVENT } from "@/components/admin/onboarding/admin-onboarding";
import { HELP_TOPICS } from "@/constants/admin-help";
import { ROUTES } from "@/constants";

/**
 * Central de ajuda no topo do painel: botão "?" que abre um menu com o tour
 * guiado, atalhos para cada área e o manual completo. Sempre acessível.
 */
export function HelpMenu(): React.ReactElement {
  const [open, setOpen] = useState(false);

  const startTour = (): void => {
    setOpen(false);
    // pequeno atraso para o diálogo fechar antes do tour destacar os elementos
    window.setTimeout(() => window.dispatchEvent(new Event(START_TOUR_EVENT)), 150);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          data-tour="help"
          aria-label="Central de ajuda"
          className="text-muted-foreground hover:text-primary"
        >
          <HelpCircle className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">Central de ajuda</DialogTitle>
          <DialogDescription>
            Aprenda a usar o painel no seu ritmo. Escolha uma opção abaixo.
          </DialogDescription>
        </DialogHeader>

        <button
          type="button"
          onClick={startTour}
          className="border-primary/20 bg-accent/60 hover:bg-accent focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <span className="bg-brand text-brand-foreground flex size-9 shrink-0 items-center justify-center rounded-lg">
            <PlayCircle className="size-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Ver como usar o painel</span>
            <span className="text-muted-foreground block text-xs">
              Tour rápido pelas principais áreas
            </span>
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          {HELP_TOPICS.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              href={`${ROUTES.admin.help}#${id}`}
              onClick={() => setOpen(false)}
              className="border-border hover:border-primary/40 hover:bg-accent/50 flex items-center gap-2 rounded-lg border p-2.5 text-sm transition-colors"
            >
              <Icon className="text-primary size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.admin.help} onClick={() => setOpen(false)}>
            <BookOpen className="size-4" />
            Abrir manual completo
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
