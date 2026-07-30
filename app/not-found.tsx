import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Página não encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mx-auto max-w-md space-y-4">
        <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">404</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Página não encontrada</h1>
        <p className="text-muted-foreground">A página que você procura não existe ou foi movida.</p>
        <div className="pt-4">
          <Button asChild>
            <Link href={ROUTES.home}>Voltar para o início</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
