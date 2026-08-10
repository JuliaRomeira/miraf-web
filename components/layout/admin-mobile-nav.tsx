"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminNav } from "@/components/layout/admin-nav";
import { Logo } from "@/components/layout/logo";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { type AdminRole } from "@/constants/navigation";
import { ROUTES } from "@/constants";

interface AdminMobileNavProps {
  /** Papel do usuário logado — repassado ao `AdminNav` para filtrar itens. */
  readonly role: AdminRole;
}

/**
 * Acesso à navegação do painel em telas pequenas (hamburger na topbar).
 * O painel lateral usa o mesmo azul-marinho da sidebar desktop.
 */
export function AdminMobileNav({ role }: AdminMobileNavProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 border-white/10 bg-gradient-to-b from-[#0e2c62] to-[#123a7e] p-0 text-white [&>button]:text-white/70 [&>button]:hover:text-white"
      >
        <SheetHeader className="h-16 justify-center border-b border-white/10 px-6">
          {/* Título mantido para leitores de tela (Radix exige); o logo é o rótulo visual. */}
          <SheetTitle className="sr-only">Painel administrativo Mira</SheetTitle>
          <Logo
            priority={false}
            overHero
            href={ROUTES.admin.dashboard}
            label="Mira — painel administrativo"
            onNavigate={() => setOpen(false)}
            tooltip={false}
          />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <AdminNav role={role} onNavigate={() => setOpen(false)} showHelp />
        </div>
      </SheetContent>
    </Sheet>
  );
}
