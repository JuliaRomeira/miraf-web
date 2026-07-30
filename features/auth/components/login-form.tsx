"use client";

import { useActionState } from "react";

import { loginAction } from "@/features/auth/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/types";

const initialState: ActionResult = { success: true, data: undefined };

export function LoginForm(): React.ReactElement {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const fieldErrors = !state.success ? state.fieldErrors : undefined;
  const formError = !state.success && !fieldErrors ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {fieldErrors?.email?.[0] && (
          <p className="text-destructive text-sm">{fieldErrors.email[0]}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {fieldErrors?.password?.[0] && (
          <p className="text-destructive text-sm">{fieldErrors.password[0]}</p>
        )}
      </div>
      {formError && <p className="text-destructive text-sm">{formError}</p>}
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
