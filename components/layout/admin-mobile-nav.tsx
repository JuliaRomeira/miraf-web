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
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-border h-16 justify-center border-b px-6">
          {/* Título mantido para leitores de tela (Radix exige); o logo é o rótulo visual. */}
          <SheetTitle className="sr-only">Painel administrativo Mira</SheetTitle>
          <Logo
            priority={false}
            href={ROUTES.admin.dashboard}
            label="Mira — painel administrativo"
            onNavigate={() => setOpen(false)}
            tooltip={false}
          />
        </SheetHeader>
        <div className="p-4">
          <AdminNav role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
