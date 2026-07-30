/**
 * Prisma Seed Script
 *
 * Popula o banco com os dados mínimos para o sistema funcionar:
 * - Usuário administrador padrão (acesso inicial ao painel).
 * - Configurações do site (Settings), editáveis depois via painel administrativo.
 *
 * Idempotente: pode ser executado múltiplas vezes sem duplicar registros
 * (usa upsert em todas as operações).
 *
 * Execução: npm run prisma:seed
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

// Prisma 7 exige um driver adapter explícito — o schema não aceita mais
// `url` no bloco `datasource`. Ver lib/prisma.ts para o mesmo padrão usado
// pelo restante da aplicação.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SALT_ROUNDS = 12;

const ADMIN_EMAIL = "admin@miraf.com.br";
const ADMIN_NAME = "Administrador";
/**
 * Senha padrão usada apenas se `ADMIN_DEFAULT_PASSWORD` não estiver definida
 * no ambiente. Deve ser alterada no primeiro acesso ao painel.
 */
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD ?? "Miraf@2026";

interface SettingSeed {
  key: string;
  value: string;
  description: string;
}

// Nome, descrição e textos do hero da home vivem no código (`constants/site.ts`,
// SITE_CONFIG) desde 2026-07-08 — por isso NÃO são semeados aqui. Apenas as
// chaves realmente editáveis pelo painel (contato, redes e e-mails de cotação).
const SETTINGS: SettingSeed[] = [
  {
    key: "contact_email",
    value: "marketing@miraff.com.br",
    description: "Email de contato institucional exibido no site.",
  },
  {
    key: "contact_phone",
    value: "(19) 3638-2200",
    description: "Telefone de contato exibido no site. Atualizar no painel.",
  },
  {
    key: "contact_whatsapp",
    value: "5511940000000",
    description:
      "Número de WhatsApp (formato E.164 sem símbolos) usado em links wa.me. Atualizar no painel.",
  },
  {
    key: "address",
    value: "Av. Brasília, 910 - Vila Zanetti, São João da Boa Vista - SP",
    description: "Endereço físico exibido no rodapé e na página de contato.",
  },
  {
    key: "instagram",
    value: "https://www.instagram.com/miradistribuidora_oficial/",
    description: "URL do perfil do Instagram.",
  },
  {
    key: "facebook",
    value: "https://www.facebook.com/miradistribuidora/?locale=pt_BR",
    description: "URL da página do Facebook.",
  },
  {
    key: "quote_email_recipient",
    value: process.env.QUOTE_RECIPIENT_EMAIL || "comercial@miraf.com.br",
    description: "Email principal que recebe as notificações de novas cotações.",
  },
  {
    key: "quote_email_cc",
    value: "",
    description: "Emails em cópia (separados por vírgula) para notificações de cotação. Opcional.",
  },
];

async function seedAdminUser(): Promise<void> {
  const passwordHash = await bcrypt.hash(ADMIN_DEFAULT_PASSWORD, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  // eslint-disable-next-line no-console
  console.log(`✔ Usuário admin garantido: ${ADMIN_EMAIL}`);
}

async function seedSettings(): Promise<void> {
  await prisma.$transaction(
    SETTINGS.map((setting) =>
      prisma.settings.upsert({
        where: { key: setting.key },
        update: { description: setting.description },
        create: setting,
      }),
    ),
  );

  // eslint-disable-next-line no-console
  console.log(`✔ ${SETTINGS.length} configurações garantidas.`);
}

async function main(): Promise<void> {
  await seedAdminUser();
  await seedSettings();

  if (!process.env.ADMIN_DEFAULT_PASSWORD) {
    console.warn(
      `⚠ ADMIN_DEFAULT_PASSWORD não definida — usando senha padrão "${ADMIN_DEFAULT_PASSWORD}". Troque-a após o primeiro login.`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error("Erro ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
