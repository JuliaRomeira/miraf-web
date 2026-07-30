"use client";

import { useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCpfCnpj, formatPhone } from "@/utils/format";

interface QuoteFormProps {
  readonly formAction: (formData: FormData) => void;
  readonly isPending: boolean;
  readonly itemsJson: string;
  readonly fieldErrors?: Record<string, string[] | undefined>;
  readonly formError?: string;
}

function FieldError({ messages }: { readonly messages?: string[] }): React.ReactElement | null {
  if (!messages?.[0]) return null;
  return <p className="text-destructive text-sm">{messages[0]}</p>;
}

/**
 * Formulário de dados do cliente. A validação/sanitização real é server-side
 * (Zod na Server Action); aqui só aplicamos máscara de exibição em CPF/CNPJ e
 * telefone para melhorar a UX. Inclui um honeypot oculto anti-bot.
 */
export function QuoteForm({
  formAction,
  isPending,
  itemsJson,
  fieldErrors,
  formError,
}: QuoteFormProps): React.ReactElement {
  const [document, setDocument] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {/* Itens do carrinho (fonte revalidada no servidor). */}
      <input type="hidden" name="items" value={itemsJson} />

      {/* Honeypot: oculto para humanos, atrai bots. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="company_website">Não preencha este campo</label>
        <input
          id="company_website"
          name="company_website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome / Empresa *</Label>
        <Input
          id="name"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          placeholder="Digite seu nome ou o nome da empresa."
        />
        <FieldError messages={fieldErrors?.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="document">CPF / CNPJ *</Label>
        <Input
          id="document"
          name="document"
          inputMode="numeric"
          required
          placeholder="000.000.000-00"
          value={document}
          onChange={(event) => setDocument(formatCpfCnpj(event.target.value))}
        />
        <FieldError messages={fieldErrors?.document} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={180}
          />
          <FieldError messages={fieldErrors?.email} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            placeholder="(00) 00000-0000"
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
          />
          <FieldError messages={fieldErrors?.phone} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" name="notes" maxLength={1000} rows={4} />
        <FieldError messages={fieldErrors?.notes} />
      </div>

      {formError && (
        <p className="text-destructive text-sm" role="alert">
          {formError}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending}>
        <Send />
        {isPending ? "Enviando..." : "Enviar solicitação de cotação"}
      </Button>
      <p className="text-muted-foreground text-xs">* Campos obrigatórios.</p>
    </form>
  );
}
