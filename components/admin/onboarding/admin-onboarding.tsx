"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { buildTourSteps } from "@/constants/admin-help";
import { type AdminRole } from "@/constants/navigation";

/** Evento global para iniciar o tour a partir da central de ajuda (topbar). */
export const START_TOUR_EVENT = "mira:start-tour";
/** Marca no navegador que o modal de boas-vindas já foi visto. */
const WELCOME_KEY = "mira:admin:welcome-seen";

interface Box {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  readonly width: number;
  readonly height: number;
}

interface AdminOnboardingProps {
  /** Papel do usuário — o tour omite as áreas que ele não acessa. */
  readonly role: AdminRole;
}

/**
 * Onboarding do painel: modal de boas-vindas na primeira visita + tour guiado.
 *
 * - O modal aparece só na primeira vez (marca em `localStorage`); depois some.
 * - O tour destaca visualmente cada área do menu com um "holofote" e um balão
 *   de explicação. Pode ser reaberto a qualquer momento pela central de ajuda
 *   (dispara o evento `mira:start-tour`).
 * - No mobile, onde o menu lateral fica escondido, os passos aparecem
 *   centralizados (sem apontar para o elemento), preservando as explicações.
 */
export function AdminOnboarding({ role }: AdminOnboardingProps): React.ReactElement | null {
  const steps = useMemo(() => buildTourSteps(role), [role]);
  const [mounted, setMounted] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [box, setBox] = useState<Box | null>(null);

  const markSeen = useCallback(() => {
    try {
      window.localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      /* localStorage indisponível — segue sem persistir */
    }
  }, []);

  const startTour = useCallback(() => {
    setWelcomeOpen(false);
    setStepIndex(0);
    setTourActive(true);
  }, []);

  const endTour = useCallback(() => {
    setTourActive(false);
    setBox(null);
  }, []);

  // Primeira montagem: decide se mostra o modal de boas-vindas.
  useEffect(() => {
    setMounted(true);
    try {
      if (!window.localStorage.getItem(WELCOME_KEY)) {
        setWelcomeOpen(true);
      }
    } catch {
      /* sem localStorage: não força o modal */
    }
  }, []);

  // Permite reabrir o tour pela central de ajuda.
  useEffect(() => {
    const handler = (): void => startTour();
    window.addEventListener(START_TOUR_EVENT, handler);
    return () => window.removeEventListener(START_TOUR_EVENT, handler);
  }, [startTour]);

  // Mede (e remede) o elemento destacado no passo atual.
  const currentStep = tourActive ? steps[stepIndex] : undefined;
  const targetSelector = currentStep?.target;

  useEffect(() => {
    if (!tourActive || !targetSelector) {
      setBox(null);
      return;
    }

    const measure = (): void => {
      const el = document.querySelector(`[data-tour="${targetSelector}"]`);
      if (!el) {
        setBox(null);
        return;
      }
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) {
        // Elemento existe mas não está visível (ex.: menu escondido no mobile).
        setBox(null);
        return;
      }
      setBox({
        top: r.top,
        left: r.left,
        right: r.right,
        bottom: r.bottom,
        width: r.width,
        height: r.height,
      });
    };

    document
      .querySelector(`[data-tour="${targetSelector}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    measure();

    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    // Re-mede enquanto o scroll suave assenta o layout.
    const interval = window.setInterval(measure, 250);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
      window.clearInterval(interval);
    };
  }, [tourActive, targetSelector, stepIndex]);

  // Esc encerra o tour.
  useEffect(() => {
    if (!tourActive) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") endTour();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourActive, endTour]);

  if (!mounted) return null;

  const isLast = stepIndex >= steps.length - 1;
  const goNext = (): void => {
    if (isLast) {
      endTour();
    } else {
      setStepIndex((i) => i + 1);
    }
  };
  const goPrev = (): void => setStepIndex((i) => Math.max(0, i - 1));

  return (
    <>
      {/* Modal de boas-vindas (primeira visita) */}
      <Dialog
        open={welcomeOpen}
        onOpenChange={(open) => {
          if (!open) markSeen();
          setWelcomeOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center gap-4 pt-2 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-[#0e2c62] text-3xl">
              👋
            </span>
            <div className="space-y-2">
              <h2 className="font-display text-xl font-semibold tracking-tight">
                Bem-vinda ao Painel Administrativo!
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Este é o espaço onde você gerencia os principais conteúdos do site da Mira — como
                produtos, categorias, fornecedores, imagens e cotações.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => {
                markSeen();
                setWelcomeOpen(false);
              }}
            >
              Agora não
            </Button>
            <Button
              variant="brand"
              onClick={() => {
                markSeen();
                startTour();
              }}
            >
              Ver como usar o painel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tour interativo */}
      {tourActive && currentStep && (
        <TourLayer
          step={stepIndex}
          total={steps.length}
          title={currentStep.title}
          body={currentStep.body}
          box={box}
          isLast={isLast}
          onNext={goNext}
          onPrev={goPrev}
          onClose={endTour}
        />
      )}
    </>
  );
}

interface TourLayerProps {
  readonly step: number;
  readonly total: number;
  readonly title: string;
  readonly body: string;
  readonly box: Box | null;
  readonly isLast: boolean;
  readonly onNext: () => void;
  readonly onPrev: () => void;
  readonly onClose: () => void;
}

/** Camada visual do tour: holofote sobre o alvo + balão de explicação. */
function TourLayer({
  step,
  total,
  title,
  body,
  box,
  isLast,
  onNext,
  onPrev,
  onClose,
}: TourLayerProps): React.ReactElement {
  const card = (
    <div className="pointer-events-auto w-full space-y-3 rounded-xl border border-white/10 bg-white p-5 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <p className="text-primary text-xs font-semibold tracking-wide uppercase">
          Passo {step + 1} de {total}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar tour"
          className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 rounded-md p-1 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>
      <h3 className="font-display text-lg leading-snug font-semibold tracking-tight">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
      <div className="flex items-center justify-between gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={onClose}>
          Pular
        </Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button variant="outline" size="sm" onClick={onPrev}>
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          )}
          <Button size="sm" onClick={onNext}>
            {isLast ? "Concluir" : "Próximo"}
            {!isLast && <ArrowRight className="size-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  // Passo sem alvo (ou alvo invisível/mobile): balão centralizado.
  if (!box) {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#06122e]/60 p-4 backdrop-blur-[1px]">
        <div className="w-full max-w-sm">{card}</div>
      </div>
    );
  }

  const pad = 6;
  const highlightStyle: CSSProperties = {
    position: "fixed",
    top: box.top - pad,
    left: box.left - pad,
    width: box.width + pad * 2,
    height: box.height + pad * 2,
  };

  return (
    <>
      {/* Captura cliques fora do balão (evita navegação acidental durante o tour). */}
      <div className="fixed inset-0 z-[60]" aria-hidden />
      {/* Holofote: recorta o alvo e escurece o resto via box-shadow. */}
      <div
        aria-hidden
        style={highlightStyle}
        className="z-[61] rounded-xl shadow-[0_0_0_9999px_rgba(6,18,46,0.6)] ring-2 ring-white"
      />
      {/* Balão posicionado ao lado do alvo. */}
      <div className="fixed z-[71]" style={tooltipStyle(box)}>
        {card}
      </div>
    </>
  );
}

/** Posiciona o balão à direita do alvo; se não couber, abaixo — sempre dentro da tela. */
function tooltipStyle(box: Box): CSSProperties {
  const margin = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(320, vw - margin * 2);

  let left = box.right + margin;
  let top = box.top;

  if (left + cardW > vw - margin) {
    left = Math.min(Math.max(margin, box.left), vw - cardW - margin);
    top = box.bottom + margin;
  }

  top = Math.min(Math.max(margin, top), Math.max(margin, vh - 240 - margin));

  return { top, left, width: cardW };
}
