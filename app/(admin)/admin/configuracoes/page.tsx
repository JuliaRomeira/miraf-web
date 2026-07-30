import { redirect } from "next/navigation";

import { getCurrentUser } from "@/features/auth/services/current-user";
import { updateSettingsAction } from "@/features/settings/actions/update-settings";
import { SettingsForm } from "@/features/settings/components/settings-form";
import { getEditableSettings } from "@/features/settings/services/site-settings";
import { ROUTES } from "@/constants";

export const metadata = {
  title: "Configurações",
};

export default async function SettingsPage(): Promise<React.ReactElement> {
  const currentUser = await getCurrentUser();

  // Apenas administradores gerenciam as configurações do site (EDITOR não tem
  // acesso — coerente com a descrição do papel na aba Usuários).
  if (currentUser?.role !== "ADMIN") {
    redirect(ROUTES.admin.dashboard);
  }

  const settings = await getEditableSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground text-sm">
          Informações do site usadas no rodapé, no hero da home, no contato e no envio de cotações.
        </p>
      </div>

      <SettingsForm action={updateSettingsAction} initial={settings} />
    </div>
  );
}
