"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/types";
import type { SettingsKey } from "@/features/settings/services/site-settings";

interface SettingsFormProps {
  readonly action: (
    prev: ActionResult<void> | null,
    formData: FormData,
  ) => Promise<ActionResult<void>>;
  readonly initial: Record<SettingsKey, string>;
}

export function SettingsForm({ action, initial }: SettingsFormProps): React.ReactElement {
  const [state, formAction, pending] = useActionState(action, null);

  const failure = state && state.success === false ? state : null;
  const saved = state?.success === true;
  const fieldError = (name: string): string | undefined => failure?.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      {saved && (
        <p
          role="status"
          className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-500"
        >
          Configurações salvas com sucesso.
        </p>
      )}
      {failure?.error && (
        <p className="border-destructive/40 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
          {failure.error}
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Contato</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact_email">E-mail</Label>
            <Input
              id="contact_email"
              name="contact_email"
              type="email"
              defaultValue={initial.contact_email}
            />
            {fieldError("contact_email") && (
              <p className="text-destructive text-sm">{fieldError("contact_email")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_phone">Telefone</Label>
            <Input id="contact_phone" name="contact_phone" defaultValue={initial.contact_phone} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_whatsapp">WhatsApp (só números)</Label>
            <Input
              id="contact_whatsapp"
              name="contact_whatsapp"
              placeholder="5511999999999"
              defaultValue={initial.contact_whatsapp}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input id="address" name="address" defaultValue={initial.address} />
            {fieldError("address") && (
              <p className="text-destructive text-sm">{fieldError("address")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">Redes sociais</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              name="instagram"
              type="url"
              placeholder="https://..."
              defaultValue={initial.instagram}
            />
            {fieldError("instagram") && (
              <p className="text-destructive text-sm">{fieldError("instagram")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              name="facebook"
              type="url"
              placeholder="https://..."
              defaultValue={initial.facebook}
            />
            {fieldError("facebook") && (
              <p className="text-destructive text-sm">{fieldError("facebook")}</p>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase">E-mails de cotação</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quote_email_recipient">Destinatário (comercial)</Label>
            <Input
              id="quote_email_recipient"
              name="quote_email_recipient"
              type="email"
              defaultValue={initial.quote_email_recipient}
            />
            {fieldError("quote_email_recipient") && (
              <p className="text-destructive text-sm">{fieldError("quote_email_recipient")}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quote_email_cc">Cópia (CC)</Label>
            <Input
              id="quote_email_cc"
              name="quote_email_cc"
              type="email"
              defaultValue={initial.quote_email_cc}
            />
            {fieldError("quote_email_cc") && (
              <p className="text-destructive text-sm">{fieldError("quote_email_cc")}</p>
            )}
          </div>
        </div>
      </section>

      <div className="border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Salvar configurações"}
        </Button>
      </div>
    </form>
  );
}
