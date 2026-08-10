"use client";

import { PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { START_TOUR_EVENT } from "@/components/admin/onboarding/admin-onboarding";

interface StartTourButtonProps {
  readonly label?: string;
  readonly variant?: "default" | "outline" | "brand";
}

/** Botão que reinicia o tour guiado (dispara o evento ouvido pelo onboarding). */
export function StartTourButton({
  label = "Iniciar tour guiado",
  variant = "brand",
}: StartTourButtonProps): React.ReactElement {
  return (
    <Button variant={variant} onClick={() => window.dispatchEvent(new Event(START_TOUR_EVENT))}>
      <PlayCircle className="size-4" />
      {label}
    </Button>
  );
}
