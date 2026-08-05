"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/layout/global-search";
import { MainNav } from "@/components/layout/main-nav";
import { QuoteCartButton } from "@/features/quote/components/quote-cart-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/constants/navigation";

interface MobileNavProps {
  readonly items: readonly NavItem[];
  /** Variante clara para o cabeçalho transparente sobre o hero (hambúrguer branco). */
  readonly light?: boolean;
}

/**
 * Menu de navegação para telas pequenas (hamburger + painel lateral).
 * Fecha automaticamente ao navegar.
 */
export function MobileNav({ items, light = false }: MobileNavProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", light && "text-white hover:bg-white/15 hover:text-white")}
          aria-label="Abrir menu"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-72 p-6">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <div className="mt-2 flex flex-col gap-6">
          <GlobalSearch onNavigate={() => setOpen(false)} />
          <MainNav
            items={items}
            label="Menu"
            className="flex-col items-stretch gap-1"
            onNavigate={() => setOpen(false)}
          />
          <QuoteCartButton className="w-full" onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
