# Mira | Catálogo e solicitações de cotação

Plataforma web moderna para geração de cotações e apresentação de catálogo, focada em food service, panificação, confeitaria e sorveterias.

> **Não é um e-commerce.** A plataforma organiza o catálogo e permite solicitar orçamentos; não realiza vendas pelo site.

## Contexto e situação do projeto

Este é um **projeto freelancer desenvolvido para uma distribuidora**, com necessidades reais de apresentação de produtos e atendimento comercial. A solução reúne catálogo consultável, detalhes dos produtos e um fluxo de solicitação de cotação para a equipe comercial.

**Status (outubro de 2026):** desenvolvimento e validação; **a plataforma ainda não foi lançada oficialmente em produção**. O endereço abaixo é uma prévia técnica, não uma indicação de operação comercial.

- **Prévia do projeto:** [miraf-web.vercel.app](https://miraf-web.vercel.app/) — ambiente de demonstração, sujeito a mudanças ou restrições de acesso
- **Escopo do catálogo:** mais de **366 produtos** considerados no projeto; **nem todos estão cadastrados ou disponíveis na interface**. Este número não representa vendas, acessos ou produtos publicados.

### Interface

![Prévia da interface da plataforma Mira](https://raw.githubusercontent.com/JuliaRomeira/portfolio-julia/main/assets/mira-interface.webp)

*Imagem utilizada no meu portfólio; representa uma etapa do projeto e pode diferir da versão atual.*

### Problema e solução

O projeto busca facilitar a descoberta de produtos de uma distribuidora e organizar pedidos de orçamento que, de outra forma, dependeriam de interações manuais e de informações dispersas.

**Fluxo implementado no código:** consulta ao catálogo e aos detalhes de produtos (incluindo informações técnicas e nutricionais, quando cadastradas), seleção de itens, solicitação de cotação e acompanhamento administrativo. A conclusão dessas funcionalidades no código **não substitui homologação nem publicação oficial**.



---

## Stack

| Camada       | Tecnologia                  |
| ------------ | --------------------------- |
| Framework    | Next.js 15 (App Router)     |
| UI           | React 19, TypeScript strict |
| Estilização  | Tailwind CSS v4, shadcn/ui  |
| Animação     | Framer Motion               |
| Ícones       | Lucide React                |
| ORM          | Prisma                      |
| Banco        | PostgreSQL 16               |
| Autenticação | Auth.js v5 (NextAuth)       |
| Validação    | Zod                         |
| Uploads      | Cloudinary                  |
| Emails       | Resend                      |
| Deploy       | Docker + VPS Ubuntu + Nginx |

---

## Requisitos

- **Node.js 20+** (o projeto usa `.nvmrc`; se você tem `nvm`, rode `nvm use`)
- **Docker + Docker Compose** (para subir o PostgreSQL local)
- **Git**

---

## Setup local

```bash
# 1) Clonar e instalar
git clone https://github.com/JuliaRomeira/miraf-web.git
cd miraf-web
npm install

# 2) Configurar variáveis de ambiente
cp .env.example .env.local
# Preencher DATABASE_URL, AUTH_SECRET etc.
# Gerar AUTH_SECRET: openssl rand -base64 32

# 3) Subir Postgres local via Docker
docker compose up -d db

# 4) Aplicar migrations e gerar o Prisma Client
npm run prisma:migrate
npm run prisma:generate

# 5) Rodar em desenvolvimento
npm run dev
```

App disponível em `http://localhost:3000`.

---

## Scripts

| Script                   | Descrição                                                 |
| ------------------------ | --------------------------------------------------------- |
| `npm run dev`            | Servidor de desenvolvimento com hot reload                |
| `npm run build`          | Build de produção (roda `prisma generate` antes)          |
| `npm run start`          | Serve o build de produção                                 |
| `npm run lint`           | Análise estática com ESLint                               |
| `npm run lint:fix`       | ESLint com correção automática                            |
| `npm run format`         | Formata todo o projeto com Prettier                       |
| `npm run format:check`   | Verifica formatação sem alterar arquivos                  |
| `npm run type-check`     | Checagem de tipos com `tsc --noEmit`                      |
| `npm run validate`       | Roda `type-check` + `lint` + `format:check` (usado em CI) |
| `npm run prisma:migrate` | Cria/aplica migration em desenvolvimento                  |
| `npm run prisma:studio`  | Abre o Prisma Studio                                      |
| `npm run prisma:seed`    | Executa o script de seed                                  |

---

## Arquitetura

Organização **por responsabilidades + por feature**. Cada pasta tem um propósito claro:

```
miraf-web/
├── app/                    # Rotas do Next.js (App Router)
│   ├── (public)/           # Route group: rotas do site público
│   ├── (admin)/            # Route group: painel administrativo
│   ├── api/                # Route handlers (health, auth, etc.)
│   ├── layout.tsx          # Layout raiz (metadata, fonts, providers)
│   ├── page.tsx            # Home
│   ├── not-found.tsx       # 404
│   ├── error.tsx           # Error boundary global
│   ├── loading.tsx         # Loading UI global
│   ├── robots.ts           # SEO — robots.txt
│   ├── sitemap.ts          # SEO — sitemap.xml
│   └── globals.css         # Design tokens + Tailwind v4
│
├── features/               # Features de negócio (vertical slicing)
│   ├── auth/               # Autenticação do admin
│   ├── product/            # Catálogo de produtos
│   └── quote/              # Sistema de cotação
│   └── <feature>/
│       ├── components/     # Componentes específicos da feature
│       ├── actions/        # Server Actions ("use server")
│       ├── services/       # Regras de negócio + acesso a dados
│       ├── schemas/        # Validação Zod
│       └── types/          # Tipos específicos
│
├── components/             # Componentes compartilhados entre features
│   ├── ui/                 # Primitivos do shadcn/ui (Button, Input, ...)
│   ├── layout/             # Header, Footer, Sidebar (site + admin)
│   └── shared/             # Componentes reutilizáveis não-UI
│
├── lib/                    # Infraestrutura e adapters (não domínio)
│   ├── prisma.ts           # Cliente Prisma singleton
│   ├── auth.ts             # Config do Auth.js
│   ├── env.ts              # Validação de env vars com Zod
│   ├── action-result.ts    # Helpers para Server Actions
│   └── utils.ts            # cn() e utilitários low-level
│
├── services/               # Serviços globais compartilhados entre features
├── actions/                # Server Actions globais compartilhadas
├── hooks/                  # Custom hooks reutilizáveis
├── utils/                  # Helpers puros de formatação/transformação
├── constants/              # Rotas, config do site, enums estáticos
├── types/                  # Tipos globais (ActionResult, Pagination, ...)
├── prisma/                 # Schema + migrations + seed
├── public/                 # Assets estáticos
└── middleware.ts           # Middleware do Next.js (proteção de rotas)
```

### Onde vai cada coisa?

| Vou criar…                                      | Onde?                                   |
| ----------------------------------------------- | --------------------------------------- |
| Uma rota nova (`/produtos/[slug]`)              | `app/(public)/produtos/[slug]/page.tsx` |
| Um componente usado só na feature de cotação    | `features/quote/components/`            |
| Um componente reutilizado em múltiplas features | `components/shared/`                    |
| Um primitivo de UI (botão, input, modal)        | `components/ui/`                        |
| Uma Server Action de uma feature                | `features/<feature>/actions/`           |
| Um schema Zod de uma feature                    | `features/<feature>/schemas/`           |
| Uma função pura de formatação                   | `utils/`                                |
| Uma constante de configuração/rotas             | `constants/`                            |
| Um tipo genérico usado no projeto todo          | `types/`                                |
| Um custom hook                                  | `hooks/`                                |
| Um adapter para serviço externo (Resend etc.)   | `lib/`                                  |

### Regras de arquitetura

1. **Server Components por padrão.** Client Components (`"use client"`) só quando houver hooks, estado, ou APIs do browser.
2. **Server Actions** validam entrada com Zod → chamam um `service` → retornam `ActionResult`.
3. **Services** contêm a lógica de negócio e são a única camada que acessa `prisma`.
4. **Componentes** nunca contêm lógica de negócio nem acessam o banco diretamente.
5. **Zero `any`.** Zero duplicação. Componente com mais de ~150 linhas é sinal de que precisa ser quebrado.

---

## Deploy

Build multi-stage otimizado com `output: "standalone"`:

```bash
docker compose --profile app up --build web
```

Health check exposto em `GET /api/health`.

Em produção (VPS + Nginx), configurar:

- `AUTH_TRUST_HOST=true`
- `AUTH_URL=https://seu-dominio.com`
- Proxy reverso do Nginx apontando para `localhost:3000`
- Certificado TLS (Let's Encrypt via Certbot)

---

## Qualidade e evolução

O repositório dispõe de scripts para verificar **tipagem**, **lint** e **formatação** (`npm run validate`). A publicação comercial requer validação com a cliente, dados completos e revisão dos fluxos em ambiente real. Verificações automatizadas de regras de negócio e CI são melhorias planejadas e não devem ser confundidas com funcionalidades já testadas.

## Aprendizados e decisões técnicas

- Organização do código por funcionalidades, com separação entre componentes, validação de entrada e serviços.
- Validação de dados com Zod e persistência relacional com PostgreSQL/Prisma.
- Estrutura para informações nutricionais e técnicas dos produtos.
- Fluxo de cotação com painel de acompanhamento, preservando a distinção entre **pedido de orçamento** e **compra online**.

Desenvolvimento: **Júlia Romeira**, em projeto freelancer com uso de ferramentas de IA como apoio em etapas do trabalho.
