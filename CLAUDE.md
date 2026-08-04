CLAUDE.md

# Mira Web Platform

## Contexto

Este projeto consiste no desenvolvimento de uma nova plataforma web para a Mira, substituindo completamente o site atual.

O objetivo é criar uma plataforma moderna, intuitiva, rápida e responsiva, focada em geração de cotações e apresentação do catálogo de produtos.

A principal referência de UX é:

https://mdiasbrancoprofissional.com.br/

A referência serve apenas como inspiração para experiência do usuário e organização do conteúdo. Nunca copiar layouts ou componentes.

---

# Público-alvo

Empresas do segmento de:

- Food Service
- Panificação
- Confeitaria
- Sorveterias

Os usuários normalmente têm pouco tempo e procuram produtos rapidamente.

Toda decisão de UX deve priorizar simplicidade e rapidez.

---

# Objetivo principal

O site NÃO é um e-commerce.

O site NÃO vende produtos.

O objetivo principal é gerar solicitações de orçamento.

---

# Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React

Backend

- Next.js Route Handlers
- Server Actions

Banco

- PostgreSQL

ORM

- Prisma

Autenticação

- Auth.js

Uploads

- Cloudinary

Emails

- Resend

Deploy

- Docker
- VPS Ubuntu
- Nginx

---

# Padrões obrigatórios

Sempre utilizar:

- TypeScript Strict
- ESLint
- Prettier
- Server Components quando possível
- Client Components apenas quando necessário

Nunca utilizar:

- any
- código duplicado
- componentes gigantes
- lógica de negócio dentro de componentes

---

# Organização

Sempre seguir esta estrutura.

app/

components/

features/

lib/

services/

hooks/

types/

prisma/

actions/

utils/

constants/

---

# Componentização

Componentes devem ser pequenos.

Cada componente deve possuir apenas uma responsabilidade.

Sempre reutilizar componentes antes de criar novos.

---

# Estilo

Priorizar:

- layout limpo
- bastante espaçamento
- interface moderna
- poucos elementos
- tipografia agradável
- animações discretas

Nunca exagerar nas animações.

---

# UX

O usuário deve conseguir:

Encontrar um produto rapidamente.

Adicionar produtos à cotação.

Enviar orçamento em poucos cliques.

Evitar fluxos longos.

---

# Sistema de Cotação

Fluxo esperado:

Produto

↓

Adicionar à cotação

↓

Minha Cotação

↓

Nome

CPF/CNPJ

Email

Telefone

Empresa (opcional)

Observações (opcional)

↓

Enviar

↓

Salvar no banco

↓

Enviar email para equipe comercial

---

# Painel Administrativo

Menus

Dashboard

Produtos

Categorias

Marcas

Cotações

Usuários

Configurações

O painel deve ser simples e intuitivo.

(A aba "Receitas" foi removida da navegação por decisão da cliente; o model `Recipe` permanece no schema. Ver "Status do Projeto".)

## Escopo de conteúdo gerenciável (decisão da cliente)

Nem tudo é editável pelo painel — só o que muda com frequência:

- **Editável no painel:** catálogo (produtos, categorias, marcas) e **Configurações do site** (contato, redes sociais, textos do hero, e-mails de cotação).
- **No código (não gerenciável):** páginas institucionais (Quem Somos, Nossas Unidades, etc.) — mudanças estruturais passam por manutenção.

Objetivo: painel **simples e intuitivo**, sem CMS genérico. Não criar models/CRUD para conteúdo institucional.

---

# Banco de Dados

Modelos principais

User

Category

Brand

Product

ProductImage

NutritionFacts

NutritionRow

Recipe

Quote

QuoteItem

Settings

Enums: UserRole, ProductStatus, QuoteStatus, DocumentType, NutrientKind.

Utilizar relacionamentos corretos no Prisma.

Status: schema completo implementado e com migration aplicada (ver seção "Status do Projeto").

---

# Performance

Priorizar:

Server Components

next/image

Lazy Loading

Dynamic Imports

Cache

Objetivo:

Lighthouse acima de 90.

---

# SEO

Implementar:

Metadata API

Open Graph

robots.txt

sitemap.xml

Schema.org

Canonical URLs

---

# Responsividade

Mobile First.

O sistema deve funcionar perfeitamente em:

Desktop

Tablet

Celular

---

# Segurança

Utilizar:

Zod

Rate Limit

Validação Server Side

Sanitização de dados

Senhas criptografadas

---

# Código

Sempre gerar código de produção.

Nunca gerar código apenas demonstrativo.

Sempre seguir boas práticas de:

- SOLID
- Clean Code
- DRY
- KISS

Sempre explicar decisões arquiteturais quando forem importantes.

Sempre sugerir melhorias quando identificar oportunidades.

---

# Status do Projeto

## 2026-07-02 — Schema Prisma completo, seed e migration inicial

Implementado:

- `prisma/schema.prisma` completo: models User, Category, Brand, Product, ProductImage, Recipe, Quote, QuoteItem e Settings; enums UserRole, ProductStatus, QuoteStatus e DocumentType; índices (inclusive compostos) e relacionamentos com `onDelete` explícito.
  - `Category` suporta subcategoria via auto-relação opcional (parent/children).
  - `Recipe` ↔ `Product` é relação m2m implícita (produtos sugeridos/usados na receita).
  - `Product` não possui campo de preço — o site não vende, apenas cota.
  - `QuoteItem → Product` usa `onDelete: Restrict` para preservar histórico de cotações mesmo se o produto for descontinuado.
- `prisma/seed.ts`: idempotente (upsert), cria o usuário admin padrão (`admin@miraf.com.br`, senha hasheada com bcrypt) e as 14 configurações iniciais do site (`site_name`, `site_description`, `contact_email`, `contact_phone`, `contact_whatsapp`, `address`, `instagram`, `facebook`, `linkedin`, `home_hero_title`, `home_hero_subtitle`, `home_hero_image`, `quote_email_recipient`, `quote_email_cc`).
- Migration `schema-completo` aplicada (substituiu a tabela `Placeholder` do scaffold inicial).

Decisão arquitetural importante — Prisma 7 e driver adapters:

- No Prisma 7, o bloco `datasource` do schema **não aceita mais `url`**. O `prisma.config.ts` só fornece a URL de conexão para a CLI (migrate, studio). Qualquer `PrismaClient` instanciado em código de aplicação (runtime) **exige um driver adapter explícito**.
- Por isso `@prisma/adapter-pg` e `pg` foram adicionados como dependências, e tanto `lib/prisma.ts` quanto `prisma/seed.ts` instanciam o client assim: `new PrismaClient({ adapter: new PrismaPg({ connectionString: ... }) })`.
- Ao criar qualquer novo `PrismaClient` no projeto (scripts, testes, etc.), sempre seguir esse mesmo padrão — nunca `new PrismaClient()` sem adapter.

Pendências conhecidas:

- Seed usa senha padrão (`Miraf@2026`) para o admin quando `ADMIN_DEFAULT_PASSWORD` não está definida no ambiente — trocar após o primeiro login em cada ambiente novo.
- `lib/auth.ts` (Auth.js) ainda não valida credenciais contra o banco — `authorize()` está com implementação provisória (retorna `null`). Fica para a feature de autenticação.
- Valores de `contact_phone`, `contact_whatsapp`, `address`, `instagram`, `facebook`, `linkedin` no seed são placeholders — atualizar via painel administrativo (Configurações) quando os dados reais existirem.

---

## 2026-07-05 — Autenticação, layouts, rebrand Mira, admin de catálogo (CRUD) e upload de imagens

### Autenticação (feature `auth`) — completa

Supersede a pendência de 2026-07-02 (`authorize()` retornava `null`).

- Config do Auth.js dividida em duas para compatibilidade com Edge:
  - `lib/auth.config.ts` — **edge-safe** (sem Prisma/bcrypt, `providers: []`), com os callbacks `authorized`/`jwt`/`session`. É a config importada pelo `middleware.ts`, que roda no Edge Runtime.
  - `lib/auth.ts` — runtime Node; estende `authConfig` e adiciona o provider `Credentials` real (usa Prisma/bcrypt, proibidos no Edge).
- `features/auth/`: `schemas/login-schema.ts` (Zod), `services/authenticate-user.ts` (`findUnique` por email → bloqueia `active: false` → `bcrypt.compare`; retorna `null` em qualquer falha), `actions/login.ts` e `actions/logout.ts`, `components/login-form.tsx`, `app/admin/login/page.tsx`.
- `middleware.ts` protege `/admin/*`; os layouts admin também checam sessão (`auth()` + `redirect`) — defesa em profundidade.

### Layouts (público e admin)

- Público — `components/layout/`: `site-header` + `main-nav` + `mobile-nav` (menu lateral via `Sheet`), `site-footer` (lê contato/redes das Settings) e `whatsapp-float`. A home foi movida para `app/(public)/page.tsx` (para receber header/footer); o hero puxa textos das Settings.
- Admin — `admin-sidebar` + `admin-nav` + `admin-mobile-nav` (`Sheet`) + `admin-topbar` (usuário logado + logout).
- `constants/navigation.ts` — fonte única dos itens de menu (público e admin).
- `features/settings/services/site-settings.ts` — `getSiteSettings()` com `unstable_cache` (tag `site-settings`). **O futuro painel de Configurações deve chamar `revalidateTag("site-settings")` ao salvar.**
- UX inspirada na referência (mdiasbrancoprofissional), **sem copiar layout**. CTA primário = "Minha cotação" (a referência converte via cadastro; aqui o eixo é a cotação).

### Rebrand: "Miraf" → "Mira"

- Nome de exibição alterado em `constants/site.ts` (`SITE_CONFIG.name`/`fullName`), no seed (`site_name`/`site_description`) e nos registros já gravados em `Settings` (update pontual).
- **Mantidos como `miraf` por ora (decisão pendente com a cliente):** e-mails (`admin@miraf.com.br` de login, `contato@`, `comercial@`), URLs de redes sociais no seed e identificadores internos (usuário/banco no Docker, pacote npm `miraf-web`). Senha padrão do admin no seed continua `Miraf@2026`.

### Receitas

- Removida a aba **Receitas** da navegação pública e do menu do painel admin (decisão da cliente). O model `Recipe` foi **mantido** no schema (sem migration destrutiva) — fácil de reativar.

### Admin de catálogo (CRUD) — Categorias, Marcas e Produtos

Padrão feature-based por entidade (`features/<entidade>/{schemas,services,actions,components}` + páginas em `app/(admin)/admin/<rota>/{page, nova|novo, [id]}`). Convenções obrigatórias ao adicionar novas entidades:

- Fluxo: **Zod → Server Action** (valida, chama service, `revalidatePath`, `redirect`) **→ service (Prisma)**. Nenhuma lógica de banco em componentes ou actions.
- Slug único automático (base + sufixo numérico) em Category/Brand/Product; SKU único em Product.
- Guardas de exclusão respeitando `onDelete`: Category bloqueia se houver produtos vinculados; Product bloqueia se estiver em cotações; Brand exclui livremente (produtos ficam sem marca — `SetNull`).
- Primitivos de UI reutilizáveis criados: `components/ui/{table,dialog,textarea}.tsx` e `components/shared/delete-button.tsx` (exclusão com confirmação em diálogo).

### Upload de imagens (Cloudinary + fallback local)

- `lib/storage/` — abstração de provedor: usa **Cloudinary** se `CLOUDINARY_*` estiverem no `.env`; senão, em **desenvolvimento**, grava em `public/uploads` (fallback local, incluído no `.gitignore`). Em produção sem provedor configurado, falha explicitamente. Pacote `cloudinary` adicionado às dependências.
- `app/api/admin/upload/route.ts` — Route Handler protegido por auth; valida tipo (JPG/PNG/WebP/GIF/AVIF) e tamanho (≤ 5 MB) no servidor e retorna **apenas a URL**. Credenciais nunca vão ao browser.
- `components/shared/image-upload.tsx` (galeria com capa/remover — usado no Produto) e `single-image-upload.tsx` (imagem única — usado no logo da Marca). O admin seleciona o arquivo do computador; salva-se só a URL gerada.
- **Ativar Cloudinary = preencher `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET` no `.env`** — nenhuma mudança de código.

### Nota de teste (ambiente de preview)

- O preview embute o app em contexto cross-site; o cookie de sessão (`SameSite=Lax`) não é enviado em requisições POST (Server Actions e upload), então o middleware redireciona para o login. Por isso os fluxos de **escrita** foram validados via scripts de service (não pelo navegador do preview). Em same-site (localhost direto / produção) funcionam normalmente. Leitura/render foram validados no navegador.

Dados de exemplo no banco (dev, ajustar/remover pelo painel): categorias "Farinhas" e "Fermentos e Leveduras", produto "Farinha de Trigo Tipo 1 Premium" e marca "Fornobom".

Pendências conhecidas:

- E-mails, domínio e identificadores internos ainda em `miraf` (aguardando definição do domínio oficial).
- Credenciais reais do Cloudinary não configuradas (dev usa fallback local).
- **Catálogo público** (listagem/filtros/detalhe) e **fluxo de cotação** ainda não implementados — próximos passos.
- **Rate limit** (previsto em "Segurança") ainda não aplicado nas rotas/actions.
- Recomendação: guardar auth também dentro das mutating actions (hoje dependem do middleware + layout).

---

## 2026-07-06 — Logotipo oficial no cabeçalho público

- Substituído o texto "Mira" do cabeçalho pelo **logotipo oficial**. Componente `components/layout/logo.tsx` (client, por causa do estado do tooltip); o `site-header` agora renderiza `<Logo />` no lugar do texto.
- Arquivo do logo em `public/logo-mira.png` (3212×1058 px). O arquivo enviado pela cliente (`Mira - Logo - Oficial.png`) foi **renomeado** para um nome web-friendly. É um asset versionado (não está no `.gitignore`, diferente de `public/uploads/`).
- Renderizado via **`next/image`** a 97×32 px (mesma proporção ~3.04:1 do original, sem distorção). Como o PNG é grande para o tamanho de exibição, o `next/image` serve uma versão otimizada/responsiva (`/_next/image?...`), em vez dos 95 KB originais — melhor nitidez e performance. `priority` por estar acima da dobra; `width`/`height` fixos reservam o espaço (sem layout shift, verificado).
- **Tooltip "Mira"** com estado explícito (não só CSS `:hover`): aparece no hover **e no foco por teclado**, some no blur e ao pressionar **Esc**, com transição de opacidade (200ms). Acessibilidade: link com `aria-label="Mira — página inicial"`, imagem com `alt="Mira"`, foco visível (ring) e tooltip `aria-hidden` (evita leitura duplicada pelo leitor de tela). Responsivo em desktop e mobile.
- **Padrão para trocar o logo depois:** basta substituir `public/logo-mira.png` (ou ajustar o `src` no `logo.tsx` se mudar de formato/nome).
- **Variação por tema:** o `logo.tsx` já alterna entre `public/logo-mira.png` (tema claro) e `public/logo-mira-dark.png` (tema escuro) via variantes `dark:` do Tailwind (estratégia de classe `.dark`). Verificado: o modo claro segue intacto e o arquivo escuro ausente **não** gera 404 (a `<Image>` escura fica `hidden` e não é requisitada até o tema escuro torná-la visível).

Pendências:

- Adicionar `public/logo-mira-dark.png` (versão escura do logo) — necessário antes de o tema escuro entrar no ar.
- **Modo escuro não ativado (decisão da cliente):** os tokens `.dark` existem no `globals.css`, mas nada aplica a classe hoje, então o site é sempre claro. Ficará para depois — a cliente quer lapidar a estética dos dois temas antes. Direção definida: **seguir o sistema** (`prefers-color-scheme`). Ao implementar, manter a estratégia de classe (ex.: `next-themes` com `defaultTheme: "system"`, que aplica `.dark` conforme o SO) para que todas as variantes `dark:` — inclusive a do logo — continuem válidas sem retrabalho.
- A sidebar do painel admin (`admin-sidebar`) ainda usa o texto "Mira Admin" — o logo não foi aplicado lá (só no cabeçalho público, conforme pedido).

---

## 2026-07-07 — Requisitos gerais da cliente + admin de Configurações

Requisitos gerais (valem para todo o projeto):

- **Manutenção/CMS com escopo:** só catálogo + Configurações do site são editáveis no painel; conteúdo institucional fica no código; painel simples (ver "Escopo de conteúdo gerenciável").
- **Responsividade:** mobile tão bom quanto desktop; hambúrguer no mobile sem cortar o cabeçalho e com tudo alinhado.
- **Design:** moderno e profissional sem exageros; animações/transições suaves; navegação intuitiva com poucos cliques; ótima UX.
- **Qualidade:** havendo mais de uma solução, priorizar melhor UX + organização de código + facilidade de manutenção.

Decisões registradas (pendentes de build):

- Cabeçalho: "Quem Somos" e "Nossas Unidades" em um **dropdown "Sobre"** (substitui o link "Sobre" atual); no mobile, grupo expansível no menu hambúrguer. Páginas institucionais **estáticas no código**.
- Marcas na home: **carrossel infinito** (auto-scroll, pausa no hover, respeita `prefers-reduced-motion`), abaixo do hero; + seção de marcas na página de produtos. Cada marca linka para `/produtos?marca=slug` (filtro já existente).

Implementado — **admin de Configurações** (`app/(admin)/admin/configuracoes`):

- `features/settings/`: `schemas/settings-schema.ts` (Zod; todos os campos opcionais — e-mail/URL só validam quando preenchidos), `services/site-settings.ts` ganhou `getEditableSettings` (valores brutos, sem fallback/cache) e `updateSettings` (upsert das 14 chaves em transação), `actions/update-settings.ts`, `components/settings-form.tsx`.
- Ao salvar, o action chama `revalidateTag(SITE_SETTINGS_TAG)` → rodapé/hero/WhatsApp do site público refletem na hora (resolve a pendência anotada em 2026-07-05).
- Imagem do hero via `SingleImageUpload` (upload, não URL).
- Verificado: round-trip do service (14 chaves, persiste e restaura) e render do formulário preenchido no painel. Escrita pelo navegador do preview segue bloqueada pelo cookie cross-site (validada via script).

Próximos: cabeçalho (dropdown "Sobre" + páginas institucionais estáticas), carrossel/seção de marcas e o fluxo de cotação.

---

## 2026-07-08 — Configurações enxutas + upload 100% local (VPS), sem Cloudinary

### Configurações (escopo reduzido pela cliente)

- Removidos do painel os campos de **Identidade do site** (nome/descrição) e **Hero** (título/subtítulo/imagem). Editáveis apenas: **Contato, Redes sociais e E-mails de cotação** (9 chaves).
- Nome, descrição e textos do hero passaram para o **código**: `SITE_CONFIG` em `constants/site.ts` (incl. `SITE_CONFIG.hero.{title,subtitle}`). O rodapé usa `SITE_CONFIG.name`/`description`; a home usa `SITE_CONFIG.hero`. Contato/redes continuam vindo das Settings.
- `getSiteSettings` agora retorna só os 9 campos editáveis. O seed ainda cria as chaves antigas (`site_name`, `home_hero_*` etc.) — ficam órfãs/ignoradas (inofensivo; podem ser removidas do seed depois).

### Upload de imagens — 100% local no servidor (VPS)

Sem Cloudinary, sem serviços de terceiros, sem URL manual, sem imagem no banco (só o caminho).

- **Cloudinary removido:** adapter (`lib/storage/cloudinary.ts`), pacote npm (`npm uninstall cloudinary`), variáveis `CLOUDINARY_*` (`env.ts`/`.env.example`) e o `images.remotePatterns` do `next.config`.
- `lib/storage/`: grava em `public/uploads/<pasta>/<uuid>.<ext>` (pastas: `products`, `brands`, `categories`). Formatos restritos a **PNG/JPG/JPEG/WEBP**; nome via UUID; extensão derivada do MIME (nunca do nome enviado). A rota `/api/admin/upload` valida auth + pasta (allowlist, anti-traversal) + formato + tamanho (5 MB) e retorna só o caminho.
- `lib/storage/cleanup.ts` — `deleteLocalUploadIfUnused(path)`: remove o arquivo do disco **apenas se nenhum registro** (ProductImage/Brand/Category) ainda o referencia; best-effort (não interrompe a operação) e com proteção contra path traversal. Ligado nos **delete e update** de Product, Brand e Category (a imagem trocada na edição também é removida se ficar órfã).
- Componentes `ImageUpload`/`SingleImageUpload` ganharam a prop `folder`. O campo de imagem da **Categoria** virou upload (antes era URL) — nenhum campo de imagem usa URL manual agora.
- **Deploy:** `public/uploads` deve ser um **volume persistente** no container (Docker standalone) para sobreviver a redeploys; pode ser servido pelo Nginx.
- Verificado por script: upload/organização em pasta, rejeição de formato inválido, remoção de órfão, guard "em uso não remove", troca na edição remove a antiga, e arquivo compartilhado só é apagado após o último registro.
- Fora de escopo: `Product.technicalSheetUrl` (ficha técnica em PDF) segue como URL — é link de documento, não imagem.

---

## 2026-07-08 — Login em `/login` + rate limiting (painel admin)

Supersede as pendências "mover login para `/login`" e "rate limiting no login" (Doc secessão / sessão 01).

### Login movido de `/admin/login` para `/login`

- Página movida: `app/admin/login/page.tsx` → **`app/login/page.tsx`** (o diretório `app/admin/` foi removido). URL curta e amigável. Continua fora dos grupos `(admin)` e `(public)` de propósito: usa só o layout raiz → tela de login limpa (sem sidebar admin, sem header/footer do site).
- `ROUTES.admin.login` agora vale **`/login`** (mantido no namespace `admin` — segue sendo o login do painel; os call sites `redirect(ROUTES.admin.login)` e `signOut({ redirectTo: ROUTES.admin.login })` herdam o novo valor sem alteração).
- `lib/auth.config.ts`: `pages.signIn` → `/login`; removido o branch morto `isOnLoginPage` (o login não está mais sob o matcher `/admin/:path*` do middleware, então nem chega ao callback `authorized`).
- **`/admin` (raiz):** nova página `app/(admin)/admin/page.tsx` que faz `redirect(ROUTES.admin.dashboard)` — logado, `/admin` cai no dashboard. Sem sessão, o middleware manda para `/login` antes.
- **Bookmarks antigos:** `/admin/login` não tem mais página; sob o matcher `/admin/*` sem sessão, o middleware redireciona para `/login` (sem 404). Verificado.

### Rate limiting no login (força bruta)

- `lib/rate-limit.ts` — limitador **em memória, janela fixa** (`checkRateLimit` / `registerAttempt` / `clearRateLimit`). Escolha deliberada para o deploy-alvo (Docker standalone, VPS única, processo Node único); documentado no arquivo que o contador zera em redeploy e não é compartilhado entre réplicas — trocar o `store` por backend compartilhado se escalar horizontalmente. Prune de buckets expirados acima de 10k chaves.
- `lib/request-ip.ts` — `getClientIp()` lê `x-forwarded-for` (1º IP) → `x-real-ip` → `"unknown"` (app roda atrás do Nginx).
- `loginAction` (`features/auth/actions/login.ts`): antes de validar credenciais, `checkRateLimit("login:<ip>")`; **só falhas contam** (`registerAttempt` no `catch` de `AuthError`), login OK não penaliza. Limite: **5 falhas / 60s por IP**. Mensagem informa os segundos restantes.
- Verificado por script (`tsx`): chave nova liberada, bloqueio na 6ª tentativa, `clearRateLimit` libera, isolamento por IP e expiração de janela. `type-check` e `lint` limpos; `/login` renderiza e os redirects (`/admin`, `/admin/dashboard`, `/admin/login`) apontam para `/login` — validados no navegador do preview.

Pendências do painel que seguem abertas: aba **Usuários** (CRUD de admins), **Cotações** (listar/atender), **Dashboard** (widgets); sidebar admin ainda com texto "Mira Admin".

---

## 2026-07-08 — Aba Usuários (CRUD de admins/editores)

Supersede a pendência "aba Usuários (CRUD de administradores)".

Feature `user` seguindo o padrão das demais entidades (`features/user/{schemas,services,actions,components}` + páginas em `app/(admin)/admin/usuarios/{page, novo, [id]}`). Fluxo Zod → Server Action → Service (Prisma), sem lógica de banco em componentes/actions.

- `schemas/user-schema.ts`: `createUserSchema` (senha obrigatória, mín. 8 / máx. 72 — limite do bcrypt) e `updateUserSchema` (senha **opcional**: em branco mantém a atual). Campos: name, email (único), role (`ADMIN`/`EDITOR`), active.
- `services/user-service.ts`: `listUsers`/`getUserById`/`createUser`/`updateUser`/`deleteUser`. Senha hasheada com **bcrypt (SALT_ROUNDS = 12**, alinhado ao seed); e-mail único (pré-check, exclui o próprio id na edição). E-mail **não** é normalizado para minúsculas — mantém a semântica exata do login atual (`findUnique` por email), evitando mismatch.
- **Proteções anti-lockout** (no service, recebendo `currentUserId` da action): não excluir/rebaixar/desativar o **próprio** acesso de admin; não remover o **último administrador ativo**. `Quote.handledBy` é `SetNull`, então excluir usuário só desvincula cotações (histórico preservado).
- **Gate ADMIN** (defesa em profundidade): as 3 páginas usam `getCurrentUser()` e redirecionam EDITOR → dashboard; as 3 actions revalidam via `requireAdminId()` (retorna erro se não-admin). **Sem auto-cadastro** — criação só por admin logado.
- `features/auth/services/current-user.ts` — novo `getCurrentUser()`: lê o usuário logado **fresco do banco** (via `session.user.id`), incl. `role`/`active`. Decisão: role não vai ao JWT — consulta barata e mudanças de papel/ativação valem na hora, sem novo login.
- UI: `components/user-form.tsx` (select de papel com descrição, senha com placeholder "manter atual" na edição). Listagem com badge "Você" na própria linha e **sem** botão de excluir para si mesmo (a auto-exclusão já é bloqueada no service — evita erro confuso). Item "Usuários" já existia em `ADMIN_NAV_ITEMS` apontando para `/admin/usuarios`.
- Verificado: `type-check` + `lint` limpos; **service testado por script `tsx` contra o banco de dev** — criação, hash bcrypt (compare confere), e-mail duplicado rejeitado, edição com/sem senha, e as 3 proteções anti-lockout. Páginas não renderizam no preview (gate ADMIN + cookie cross-site), mesma limitação já registrada.

Nota/nicety pendente: o item "Usuários" da sidebar aparece para qualquer usuário logado; um EDITOR que clicar é redirecionado ao dashboard (o gate funciona, mas o ideal seria ocultar o item para não-admins — exige passar o `role` para a navegação). Hoje só existem admins, então impacto baixo.

Pendências do painel que seguem abertas: **Cotações** (listar/atender), **Dashboard** (widgets); sidebar admin ainda com texto "Mira Admin".

---

## 2026-07-08 — Fornecedores (apresentação): carrossel na home + seção em produtos

Decisão da cliente: **"Fornecedores" = as "Marcas" existentes** (model `Brand`). Não criar entidade nova. O rótulo **público** passa a ser "Fornecedores"; **model/rotas/admin permanecem `brand`/`marcas`** (sem churn de DB/CRUD). Sem página dedicada nem item de menu para fornecedores — eles aparecem só em dois lugares, sempre clicáveis, levando à listagem já filtrada.

- **Menu:** removido "Marcas" de `PUBLIC_NAV_ITEMS` (`constants/navigation.ts`) — some do header e do footer (ambos consomem essa lista).
- **Página `/marcas`:** virou `redirect(ROUTES.products)` (`app/(public)/marcas/page.tsx`) — mantém links/bookmarks antigos sem 404. `ROUTES.brands` continua definido só como origem do redirect.
- **Home** (`app/(public)/page.tsx`, agora async): carrossel infinito abaixo do hero. Novo `features/catalog/components/supplier-carousel.tsx` (client) — marquee CSS: lista duplicada deslizando a `-50%` (loop contínuo), pausa no hover, `prefers-reduced-motion` respeitado pela regra global do `globals.css`. Keyframe `marquee` adicionado ao `globals.css`. Fade nas bordas via `mask-image`. Cópia duplicada com `aria-hidden`+`tabIndex=-1`.
- **Página de produtos** (`app/(public)/produtos/page.tsx`): nova seção de destaque acima da listagem. Novo `features/catalog/components/supplier-section.tsx` (client, usa `useSearchParams`): chips clicáveis; o ativo fica destacado; clicar no ativo (ou em "Ver todos os produtos") limpa o filtro. Preserva os demais filtros (busca/categoria) e reinicia paginação — mesma lógica do `ProductFilters`.
- **Filtro:** rótulos do select em `ProductFilters` renomeados para "Fornecedores"/"Todos os fornecedores" (aria "Filtrar por fornecedor"). **Param de URL segue `?marca=slug`** (interno, já usado por todo o filtro) — não renomeei para evitar churn; carrossel e seção apontam para ele.
- Ambos exibem só fornecedores **com produtos ativos** (`_count.products > 0`) para não levar a listagens vazias; sem logo, cai no fallback com o nome.
- Verificado no navegador (conteúdo público): home mostra o carrossel (`animation: marquee 40s`, links → `/produtos?marca=fornobom`); página de produtos mostra a seção, clicar aplica `?marca=`, destaca o chip, sincroniza o select e filtra a lista; "Ver todos" e clicar de novo limpam; `/marcas` redireciona para `/produtos`; menu sem "Marcas". `type-check` + `lint` limpos.
- **Dado de dev ajustado:** o produto de exemplo ("Farinha de Trigo Tipo 1 Premium", ACTIVE) estava **sem marca** e a marca "Fornobom" sem produtos — vinculei um ao outro para o carrossel/seção terem conteúdo demonstrável. Ajustável pelo painel.

Pendência/nicety: o admin ainda usa o rótulo "Marcas" (nav + páginas). Se a cliente quiser consistência total, renomear os textos do admin para "Fornecedores" (mantendo `brand`/rotas internos) é um ajuste de strings de baixo risco.

---

## 2026-07-09 — Dashboard do painel (widgets)

Supersede a pendência "Dashboard (widgets)". A página `app/(admin)/admin/dashboard/page.tsx` deixou de ser placeholder e passou a mostrar a visão geral da operação.

Feature `dashboard` — **somente leitura**, então **não há Zod nem Server Action** (esse fluxo é para escrita); a página é Server Component e consome direto o service.

- `features/dashboard/services/dashboard-service.ts`:
  - `getDashboardStats()` — um único `Promise.all` com `count`/`groupBy` para: total de cotações, cotações dos últimos 30 dias, cotações por status, total de produtos, produtos por status, nº de categorias e de marcas. Helper `tallyByStatus()` zera todos os status do enum e sobrepõe os presentes (evita `undefined` quando um status não tem registros).
  - `getRecentQuotes()` — últimas 5 cotações (`orderBy createdAt desc`), com `_count.items` mapeado para `itemCount`.
- Componentes (todos Server Components, sem `"use client"`):
  - `components/stat-card.tsx` — KPI reutilizável; vira `<Link>` só quando recebe `href`; prop `emphasis` destaca o card acionável.
  - `components/recent-quotes.tsx` — lista das recentes com empty state; **ainda sem link para detalhe** (a aba Cotações não existe — ver abaixo).
  - `components/quote-status-summary.tsx` — distribuição por status com barra proporcional ao total.
  - `components/quote-status-badge.tsx` — `QUOTE_STATUS_LABEL` + cores por status. **Ao construir a aba Cotações, promover esse mapa para um módulo compartilhado** (hoje mora no dashboard).
- Cards da página: **Cotações pendentes** (destaque, sem link — a rota `/admin/cotacoes` ainda não existe), **Produtos ativos** (→ `/admin/produtos`), **Categorias** (→ `/admin/categorias`), **Fornecedores** (→ `/admin/marcas`). Decisão: não linkar o card de cotações nem as linhas recentes enquanto a aba Cotações não existir, para não gerar link morto (404).
- Verificado: `type-check` + `lint` limpos; **service testado por script `tsx` contra o banco de dev** — caminho vazio (bate com o seed: 1 produto ativo, 2 categorias, 1 marca, 0 cotações) e caminho com dados (4 cotações temporárias em PENDING/IN_PROGRESS/COMPLETED → soma dos status = total, recentes ordenadas por data, `itemCount` correto), com **limpeza** restaurando o banco a 0 cotações. No preview a rota compila e o middleware redireciona `/admin/dashboard` → `/login` (cookie cross-site) — mesma limitação já registrada para páginas admin; sem erros de servidor.

Pendências do painel que seguem abertas: **Cotações** (listar/atender — próxima entrega, junto/depois do fluxo público de cotação); sidebar admin ainda com texto "Mira Admin"; item "Usuários" visível para não-admins.

---

## 2026-07-09 — Fluxo público de cotação (o coração do site)

Supersede o placeholder de `add-to-quote-button.tsx` e a pendência "fluxo de cotação ainda não implementado". Segue o plano da Sessão 03 (Doc secessão). Feature `quote` no padrão feature-based (`features/quote/{store,schemas,services,actions,components}`).

Decisões da cliente (confirmadas nesta sessão): **CPF/CNPJ validado por dígito verificador**; **e-mail de confirmação ao cliente = sim**; **protocolo `ORC-000123`**; **Resend configurado depois** (degradação graciosa por ora).

### Carrinho (estado no cliente)

- `features/quote/store/quote-cart-context.tsx` — Context + Provider persistindo em `localStorage` (chave `mira:quote-cart`). Guarda só `{ productId, slug, name, imageUrl, quantity }`. Hidrata após montar (flag `hydrated` evita mismatch SSR/CSR e flash do empty state), persiste em cada mudança, sincroniza entre abas (evento `storage`), descarta dados corrompidos. Provider montado em `app/(public)/layout.tsx` (envolve todo o site público).
- `components/quote-cart-button.tsx` — CTA "Minha cotação" com **badge de contador** (some antes de hidratar / quando 0). Usado no `site-header` (desktop) e no `mobile-nav`.
- `add-to-quote-button.tsx` reescrito: usa o store; se o produto já está na cotação, vira atalho "Ver minha cotação" (quantidade é editada na página, não duplica). A página de detalhe passa `{ productId, slug, name, imageUrl }`.

### Página `/minha-cotacao`

- `app/(public)/minha-cotacao/page.tsx` (thin wrapper, `robots: noindex`) → `quote-cart-view.tsx` (client, orquestra estado + `useActionState`).
- `quote-item-list.tsx` (qtd via stepper/input, remover, esvaziar), `quote-form.tsx` (dados do cliente, máscara de exibição CPF/CNPJ + telefone, honeypot oculto), `quote-success.tsx` (protocolo + "voltar aos produtos"). Três estados = três `h1` distintos (vazio / formulário / sucesso), sem `h1` duplicado.

### Validação, service e action

- `utils/document.ts` — `isValidCPF`/`isValidCNPJ` por **dígito verificador** (rejeita dígitos repetidos). `features/quote/schemas/quote-schema.ts` (Zod): sanitiza `document`/`phone` (só dígitos) **antes** de validar; **um único campo CPF/CNPJ** com `documentType` derivado do nº de dígitos (menos cliques); itens `{ productId, quantity }` não-vazios.
- `services/quote-service.ts` — `createQuote` em `$transaction`: revalida produtos (só `ACTIVE` entram; itens inválidos são descartados; nenhum válido → `NoValidItemsError`), gera **protocolo atômico** via upsert `INSERT ... ON CONFLICT DO UPDATE` na chave `Settings.quote_sequence` (sem corrida, sem migration), grava `Quote` + `QuoteItem`s. A **fonte da verdade é o servidor** — nome/imagem do cliente nunca são confiados.
- `actions/create-quote.ts` — ordem: honeypot → `getClientIp` → **rate limit** (5 envios / 10 min por IP; só envios efetivos contam) → Zod → `createQuote` → `sendQuoteEmails` (best-effort) → `actionSuccess({ protocol })`.

### E-mail (Resend) — degradação graciosa

- Pacote `resend` instalado. `services/quote-email.ts` envia 2 e-mails (comercial + confirmação ao cliente). Destinatário: **Settings** (`quote_email_recipient`/`quote_email_cc`) → fallback `env.QUOTE_RECIPIENT_EMAIL`. **Nunca lança**: sem `RESEND_API_KEY`/`RESEND_FROM_EMAIL` (ex.: dev) ou em erro, a cotação **já está salva** e o fato é logado — a solicitação nunca se perde. HTML inline com escape.
- **Bug corrigido de passagem:** `RESEND_FROM_EMAIL` em `lib/env.ts` validava com `.email()`, o que **rejeitaria** o formato `"Mira <cotacao@dominio>"` documentado no `.env.example` (crash no boot em produção). Agora aceita e-mail puro **ou** com nome de exibição.
- **Ativar e-mail em produção = preencher `RESEND_API_KEY` + `RESEND_FROM_EMAIL`** (e destino via Settings ou `QUOTE_RECIPIENT_EMAIL`) — sem mudança de código.

### Verificação

- `type-check` + `lint` + `format` limpos. **Service/schema/validadores testados por script `tsx`** (24 checagens: dígito verificador CPF/CNPJ, sanitização, derivação de tipo, protocolo `ORC-000001` + incremento sequencial, revalidação de produto inativo/inexistente, `NoValidItemsError`, persistência), com **limpeza** restaurando o banco (0 cotações, contador removido).
- **Fluxo ponta-a-ponta validado no navegador** (o público renderiza no preview, ao contrário do admin): adicionar produto → badge "1 item" → `/minha-cotacao` (lista + form) → preencher (máscara CNPJ/telefone conferida) → enviar → **tela de sucesso com `ORC-000001`** + carrinho limpo + log de degradação graciosa do e-mail. Cotação de teste removida do banco em seguida.

Pendências / próximos:

- **Aba Cotações no painel** (`/admin/cotacoes`, listar/atender) — agora desbloqueada (há cotações entrando). Ao construí-la: **promover `QUOTE_STATUS_LABEL`** (hoje em `features/dashboard/components/quote-status-badge.tsx`) para módulo compartilhado e **ligar os cards/linhas do Dashboard** (hoje sem link para não gerar 404).
- Botão "adicionar à cotação" **nos cards da listagem** ficou de fora (opcional na Sessão 03) — hoje só na página de detalhe.
- Resend real, rate limit nas demais actions e captcha (se houver spam) seguem como antes.

---

## 2026-07-09 — Aba Cotações no painel + rename "Marcas" → "Fornecedores" (UI)

Supersede a pendência "Cotações (listar/atender)". Duas entregas nesta rodada.

### Aba Cotações (`/admin/cotacoes`)

Gestão das solicitações recebidas pelo fluxo público. Somente leitura + atualização de status/responsável + exclusão — parte na feature `quote` existente, separada do fluxo público:

- **Módulo compartilhado de status** (resolve o TODO do dashboard): `features/quote/constants/quote-status.ts` (`QUOTE_STATUS_LABEL`, `QUOTE_STATUS_ORDER`, `QUOTE_STATUS_BADGE_CLASS`, `QUOTE_STATUS_BAR_CLASS`) e `features/quote/components/quote-status-badge.tsx`. O `quote-status-badge.tsx` do dashboard foi **removido**; `recent-quotes` e `quote-status-summary` agora importam do módulo compartilhado.
- `services/quote-admin-service.ts` — `listQuotes({status?})` (com `itemCount` e nome do responsável), `getQuoteById` (itens + produto + `handledBy`), `updateQuote` (status + `handledById`, nulo remove atribuição), `deleteQuote` (itens somem por cascade).
- `schemas/quote-admin-schema.ts` — `updateQuoteSchema` (status + `handledById` opcional, vazio → null).
- `actions/quote-admin-actions.ts` — `updateQuoteAction`/`deleteQuoteAction`; gate `requireUser()` (ADMIN **ou** EDITOR — cotações são operacionais, ver papéis no schema); `revalidatePath` da lista e do detalhe.
- Páginas: `app/(admin)/admin/cotacoes/page.tsx` (tabela + filtro por status via `?status=`, empty states, excluir com confirmação) e `.../[id]/page.tsx` (dados do cliente com máscara CPF/CNPJ+telefone, lista de itens com aviso de produto inativo, painel de atendimento).
- `components/quote-detail-manager.tsx` (client) — muda status e atribui responsável via `useActionState`; **selects controlados sincronizados às props frescas** (após salvar, o action revalida e reenvia os dados — os campos nunca ficam defasados do badge do cabeçalho).
- **Dashboard ligado** (resolve o outro TODO): card "Cotações pendentes" agora linka para `/admin/cotacoes`; cada linha de "Cotações recentes" linka para o detalhe. Sem mais links mortos.

### Rename "Marcas" → "Fornecedores" (somente rótulos)

Decisão da cliente: o rótulo visível passa a ser **"Fornecedores"** em todo o sistema. Mantida a **arquitetura interna** intacta — model `Brand`, rotas `/admin/marcas` e `/marcas`, folders, variáveis `brand`/`brands` e o param de filtro `?marca=` **não** mudaram (evita churn de DB/URLs/migrations). Só texto de interface:

- `constants/navigation.ts`: item admin "Marcas" → "Fornecedores" (ícone `Tags` → `Building2`, alinhado ao card do dashboard).
- Páginas admin de marcas (`page`/`nova`/`[id]`): títulos, headings, botões ("Novo fornecedor", "Criar/Editar fornecedor"), empty state, aria-labels, status "Ativo/Inativo".
- `product-form.tsx` (label do select), `admin/produtos/page.tsx` (coluna da tabela), `brand-form.tsx` ("Ativo…"), `brand-actions.ts` (mensagens de erro) → "fornecedor".
- Público já usava "Fornecedores" (carrossel/seção/filtro, desde 2026-07-08) — nada visível mudou lá.

### Verificação

- `type-check` + `lint` + `format` limpos.
- **Service de gestão testado por script `tsx`** (13 checagens: listagem + `itemCount` + company, filtro por status inclui/exclui, detalhe com itens, atribuir/remover responsável, mudança de status, exclusão), com limpeza do banco.
- **UI verificada no navegador** (a sessão do preview estava autenticada nesta rodada, então as páginas admin renderizaram): sidebar mostra "Fornecedores" e "Cotações"; lista com filtros e empty state; detalhe com dados/itens/atendimento; salvar mudou o status (badge Pendente→Em atendimento→Concluída, "Alterações salvas"); reload confirma selects refletindo o banco. POST de Server Action em contexto cross-site do preview volta a cair no login (limitação já registrada) — não é bug.

Pendências que seguem abertas: sidebar admin ainda com texto "Mira Admin" (logo não aplicado lá); item "Usuários" visível para não-admins; Resend real; rate limit nas demais actions; botão "adicionar à cotação" nos cards da listagem (opcional).

---

## 2026-07-09 — Rename estrutural: `Brand`/`marca` → `Supplier`/`fornecedor`

Supersede a decisão anterior de manter `brand`/`marcas` internos (2026-07-08). A cliente pediu para renomear **também a estrutura** (não só os rótulos) para evitar confusão. Convenção mantida: **identificadores em inglês** (`Supplier`, como `Product`/`Category`) e **rotas/UI em português** (`/fornecedores`).

### Banco — sem migração (via `@@map`)

- `model Brand` → **`model Supplier`** no schema, mas a **tabela física continua `Brand`** via `@@map("Brand")`. `Product.brand`/`brandId` → **`supplier`/`supplierId`** com `@map("brandId")`. Nomes de unique/índice/FK preservados via `map:` (`Brand_slug_key`, `Brand_active_idx`, `Product_brandId_idx`, `Product_brandId_fkey`) — **zero drift, nenhuma migração, nenhum dado perdido**.
- Decisão: renomear a tabela de fato exigiria uma migração destrutiva (Prisma vê rename como drop+create) que apagaria os fornecedores/vínculos de dev. O `@@map` dá consistência total no código sem esse risco. Só `prisma generate` foi rodado (não `migrate`). Verificado por script que `prisma.supplier` grava/lê na tabela `Brand`.

### Código, rotas e pastas

- Pastas: `features/brand/` → **`features/supplier/`** (arquivos `supplier-{schema,service,actions,form}`); `app/(admin)/admin/marcas/` → **`.../fornecedores/`**; `app/(public)/marcas/` → **`.../fornecedores/`** (redirect para `/produtos`).
- `ROUTES.brands`/`ROUTES.admin.brands` → **`ROUTES.suppliers`** (`/fornecedores`) / **`ROUTES.admin.suppliers`** (`/admin/fornecedores`).
- Identificadores: `listBrands`→`listSuppliers`, `getBrandById`→`getSupplierById`, `listBrandOptions`→`listSupplierOptions`, `listActiveBrands`→`listActiveSuppliers`, `createBrand`/`updateBrand`/`deleteBrand`(+`...Action`)→`...Supplier`, `BrandForm`→`SupplierForm`, `BrandInput`/`brandSchema`→`Supplier...`, `brandSlug`→`supplierSlug`, `stats.brands`→`stats.suppliers`. `prisma.brand`→`prisma.supplier` em todos os call sites (product-service, catalog-service, dashboard-service, cleanup).
- **Param de URL público** `?marca=` → **`?fornecedor=`** (filtro, carrossel e seção da página de produtos).
- Upload: `UPLOAD_FOLDERS` `"brands"` → **`"suppliers"`** (novos logos em `public/uploads/suppliers/`; caminhos antigos em `/uploads/brands/` seguem servindo normalmente pois o path fica salvo no registro).
- **Rotas antigas `/marcas` e `/admin/marcas` deixam de existir** (pastas movidas). `/marcas` público não tem mais redirect próprio — se quiser preservar bookmarks externos antigos, criar um redirect depois (baixa prioridade; o menu nunca expôs essa URL).

### Verificação

- `rm -rf .next` (limpar types stale das rotas antigas) + `prisma generate` + `type-check` + `lint` + `format` limpos.
- **8 checagens por script `tsx`**: `listSuppliers`, `listActiveSuppliers` (com `_count`), `listPublicProducts({supplierSlug})`, `getPublicProductBySlug` (inclui `supplier`), `getDashboardStats().suppliers`, CRUD round-trip e **confirmação de que o registro existe fisicamente na tabela `Brand`** (prova do `@@map`).
- Navegador: home, `/produtos`, **`/produtos?fornecedor=fornobom`** (filtra 1 produto, chip "Fornobom" ativo, select "Filtrar por fornecedor"), `/fornecedores` (redirect → `/produtos`). Rotas admin compilam (redirect a `/login` por auth no preview — sem erro de servidor).

---

## 2026-07-09 — Menu público, página "Nossas Unidades", rodapé (logo + dados) e favicon

Sessão focada em ajustes de UX/conteúdo do site público (nenhuma mudança de schema/DB estrutural).

### Menu público (`constants/navigation.ts`)

`PUBLIC_NAV_ITEMS` reorganizado (fonte única — reflete em header, `mobile-nav` e footer):

- Removido **"Categorias"** (não fazia sentido no menu principal).
- Adicionado **"Início"** (`ROUTES.home`) na primeira posição.
- Removido **"Contato"** (a página `/contato` ainda não existe — some o link morto).
- Ordem final: **Início · Sobre · Produtos · Nossas Unidades**.

### Página institucional "Nossas Unidades" (`/nossas-unidades`)

Conteúdo institucional **estático no código** (decisão da cliente — ver "Escopo de conteúdo gerenciável"). Novos arquivos:

- `constants/units.ts` — tipo `CompanyUnit` + array `COMPANY_UNITS` (única fonte a editar). Campos: `id`, `name`, `type` ("Matriz"|"Filial"), `street`, `district?`, `city`, `state`, `zipCode?`, `phone?`, `whatsapp?`, `email?`, `hours?`.
- `components/institutional/unit-card.tsx` — card por unidade (sem `"use client"`). Estilo: borda, badge Matriz/Filial, hover com elevação (`hover:-translate-y-1`) + sombra, matriz com anel de destaque.
- `app/(public)/nossas-unidades/page.tsx` — Server Component; ordena a matriz primeiro; grid responsivo (1/2/3 colunas).
- `ROUTES.units = "/nossas-unidades"` em `constants/site.ts`.

Layout do card (iterado várias vezes com a cliente até o formato final):

- **Título = `Cidade - UF`** (ex.: "São João da Boa Vista - SP"). O badge (Matriz/Filial) fica acima; o campo `unit.name` deixou de ser usado no display (permanece nos dados, inofensivo).
- **Endereço** em linhas: rua + bairro, e **CEP em linha própria** (quebra antes do CEP). `whitespace-nowrap` na cidade-estado evita quebra estranha.
- **Telefone** clicável (`tel:`); **horário** com leve realce.
- Botão **"Ver no mapa"** (componente `Button`, preenchido, largura total) — abre o Google Maps com rota (`buildMapUrl`) **gerada a partir do endereço** (sem URL manual; auto-atualiza se o endereço mudar).

Dados reais (dev): **Matriz — São João da Boa Vista** (Av. Brasília, 910 - Vila Zanetti, CEP 13870-590, (19) 3638-2200); **Filial — Ribeirão Preto** (Rua Dr. Hugo Fortes, 940, CEP 14095-260, (16) 3628-7505); **Filial — São José do Rio Preto** (Av. Dr. Aniloel Nazareth, 5700, CEP 15070-585, (17) 3225-6011). **Horário é placeholder** ("Seg. a sex., 8h às 18h") — confirmar o real.

### Rodapé (`components/layout/site-footer.tsx`)

- **Nome → logo**: reusa o componente `Logo` (DRY) — imagem + tooltip "Mira" (hover/foco) + link pra home. `Logo` ganhou prop `priority` (default `true`; footer passa `false`, pois está abaixo da dobra).
- **Tagline nova** (`SITE_CONFIG.footerTagline` em `constants/site.ts`): "Desde 1982 distribuindo qualidade e confiança para panificação, confeitaria, sorveterias e food service." (o `SITE_CONFIG.description` continua para SEO).
- **Linha de crédito**: "Desenvolvido por Júlia Romeira" abaixo do copyright.

### Dados de contato/redes (Settings, editável no painel)

Valores reais gravados no **banco dev** (via script `tsx` pontual) **e** alinhados nos **defaults do seed** (`prisma/seed.ts`):

- `contact_email` → **marketing@miraff.com.br** (domínio **miraff**, dois "f" — igual ao e-mail da cliente).
- `contact_phone` → **(19) 3638-2200**.
- `address` → **Av. Brasília, 910 - Vila Zanetti, São João da Boa Vista - SP**.
- `instagram` → https://www.instagram.com/miradistribuidora_oficial/
- `facebook` → https://www.facebook.com/miradistribuidora/?locale=pt_BR

Como o rodapé usa `getSiteSettings` (`unstable_cache`, tag `site-settings`), após editar o banco direto foi disparado `revalidateTag(SITE_SETTINGS_TAG)` — mesma revalidação que o painel faz ao salvar (usei uma rota de dev temporária, já removida).

### LinkedIn removido por completo

A Mira não tem LinkedIn. Removido **ponta a ponta**: footer (array `socials`), `SETTINGS_KEYS`/`SiteSettings`/loaders (`site-settings.ts`), `settingsSchema` (`settings-schema.ts`), campo do formulário do painel (`settings-form.tsx`, grid 3→2 colunas), `seed.ts`, e a linha `linkedin` foi **deletada do banco**. Painel de Configurações agora mostra só Instagram/Facebook.

### Favicon + indicador de dev

- **Favicon = emblema da Mira**: `app/icon.png` (512×512) gerado recortando o **emblema circular vermelho** de `public/logo-mira.png` com `sharp` (crop `{left:20,top:8,width:1275,height:1045}` + `fit:contain` transparente). Removido o `app/favicon.ico` padrão do Next (o triângulo). Browsers cacheiam favicon agressivamente — hard refresh para ver na hora.
- **Indicador de dev do Next** (círculo "N" no canto): `devIndicators: false` no `next.config.ts`. É dev-only (nunca em produção); desativado para não poluir o preview.

### Verificação

- `type-check`, `lint` e Prettier limpos ao longo da sessão.
- Conteúdo verificado por **DOM/estilos computados** (menu, cards das unidades em 320/375/768/1366px sem overflow, rodapé com logo+tooltip+tagline+crédito, redes só Instagram/Facebook, favicon `link rel=icon → /icon.png`, badge "N" ausente). **Screenshots do preview ficaram intermitentes** (trava do painel embutido nesta sessão) — verificação feita via DOM, que é conclusiva para estrutura/estilos.

### Pendências / próximos

- **Página "Sobre"** (`/sobre`) — próxima entrega; a cliente vai enviar o conteúdo. `/sobre` e `/contato` ainda dão 404 (sem página).
- **Horário das unidades** é placeholder — confirmar o real (mesmo para todas ou por unidade).
- Opcionais oferecidos: `app/apple-icon.png` (ícone iOS), crédito do rodapé como link (LinkedIn/GitHub/portfólio da Júlia).
- `unit.name` sem uso no display (pode ser removido do modelo depois).

---

## 2026-07-10 — Acabamentos do painel (logo na sidebar, nav por papel, auth + rate limit nas actions)

Fecha os itens de "Prioridade 2 — Acabamentos do painel" (Doc secessão 06). Nenhuma mudança de schema/DB.

### Logo na sidebar do admin (supersede "sidebar com texto 'Mira Admin'")

- `components/layout/logo.tsx` ganhou props para reuso fora do site público: `href` (default `ROUTES.home`), `label` (aria-label), `onNavigate` (fecha o menu mobile ao clicar, padrão do `AdminNav`) e `tooltip` (default `true`).
- `admin-sidebar` e `admin-mobile-nav` agora renderizam `<Logo href={ROUTES.admin.dashboard} label="Mira — painel administrativo" priority={false} />` no lugar do texto "Mira Admin". O texto sumiu de ambos (removido o uso de `SITE_CONFIG.name` lá).
- **Tooltip desligado só no menu mobile** (`tooltip={false}`): o `Sheet` (Radix) foca o primeiro elemento ao abrir — que é o logo — e o tooltip surgiria sozinho a cada abertura. O `aria-label` permanece (acessibilidade intacta). No desktop o tooltip continua (só no hover/foco, não incomoda). No mobile, `SheetTitle` virou `sr-only` (Radix exige um título acessível) com o logo como rótulo visual.

### Navegação por papel — esconder itens ADMIN-only de EDITOR (supersede "item Usuários visível para não-admins")

- `constants/navigation.ts`: `AdminNavItem` ganhou `adminOnly?`; marcados **Usuários** e **Configurações** como `adminOnly: true`. Novo helper `visibleAdminNavItems(role)` e tipo `AdminRole`.
- **Correção de coerência:** a descrição do papel na aba Usuários já dizia "Editor — gerencia catálogo e cotações, **sem usuários/configurações**", mas Configurações estava acessível a EDITOR (sem gate na página, sem restrição na action). Alinhado: Configurações agora é ADMIN-only nos 3 níveis — nav (escondido), página (`getCurrentUser` → `redirect(dashboard)` se não-ADMIN, mesmo padrão da página de Usuários) e action (`adminOnly: true`).
- Fluxo do `role`: `app/(admin)/layout.tsx` passou a usar `getCurrentUser()` (antes `auth()`) — uma única leitura fresca do banco que **também derruba usuário desativado no meio da sessão** e fornece o `role`. O layout repassa `role` para `AdminSidebar` → `AdminNav` e `userName`/`role` para `AdminTopbar` → `AdminMobileNav` → `AdminNav`. `AdminTopbar` deixou de chamar `auth()` (deduplicado; virou componente síncrono com props). O gate continua sendo defesa em profundidade (middleware + layout + página + action).

### Auth + rate limit dentro das mutating actions (supersede itens 2.3 e 2.4)

- Novo guard compartilhado `features/auth/services/action-guard.ts` → `guardAdminWrite({ scope, adminOnly? })`: exige usuário logado/ativo, opcionalmente restringe a ADMIN e aplica **rate limit por IP** (`admin-write:<scope>:<ip>`, 40 ops/60s — teto folgado contra abuso, nunca atrapalha admin real). Retorna `{ ok, user }` ou `{ ok, message }` pronto para `actionError`.
- `lib/rate-limit.ts` ganhou `consumeRateLimit` (verifica e, se houver folga, já registra — caso "toda tentativa conta", diferente do login onde só falhas contam).
- Aplicado nas actions de **Categoria, Produto, Fornecedor** (antes dependiam só de middleware+layout — resolve 2.4) e em **Configurações** (`adminOnly`). As actions de **Usuário** e **Cotação** foram **padronizadas** para o mesmo guard: `user-actions` trocou o `requireAdminId` local por `guardAdminWrite({ adminOnly: true })` (usa `guard.user.id` nas proteções anti-lockout); `quote-admin-actions` trocou o `requireUser` local por `guardAdminWrite` (ADMIN ou EDITOR — cotações são operacionais). Removidas as duplicações locais.

### Verificação

- `type-check`, `lint` e Prettier limpos (nos arquivos alterados; avisos de `format:check` são só de `graphify-out/*` e `tsconfig.json`, pré-existentes).
- **Fluxo admin validado no navegador** (a sessão do preview logou nesta rodada, inclusive POSTs de Server Action): login como ADMIN → sidebar com logo (desktop) + os 7 itens; criado um EDITOR de teste via a aba Usuários → login como EDITOR → sidebar mostra só Dashboard/Produtos/Categorias/Fornecedores/Cotações (**Usuários e Configurações escondidos**) → acesso direto a `/admin/configuracoes` **redireciona ao dashboard** (gate de página). Menu mobile (375px) abre com o logo, sem tooltip flutuante. EDITOR de teste **excluído** ao final (banco restaurado: só o admin).

Pendências do painel: nenhuma dos "Acabamentos" (P2) restante. Seguem abertas as de produção (P1: domínio/e-mails, Resend, senha admin, deploy) e P3/P4 (página "Sobre", modo escuro, limpezas). Nota: o rate limit em memória não é compartilhado entre réplicas (documentado em `lib/rate-limit.ts`).

---

## 2026-07-10 — Página "Quem Somos" (`/sobre`)

Supersede a pendência "página Sobre (404)" da Sessão 07. Conteúdo institucional **estático no código** (padrão da casa — ver "Escopo de conteúdo gerenciável"), no mesmo formato de `app/(public)/nossas-unidades/`.

- Novo `app/(public)/sobre/page.tsx` — Server Component, sem estado/client. `metadata` (title "Quem Somos" + description para SEO). O item "Sobre" do menu (`PUBLIC_NAV_ITEMS` → `ROUTES.about`) já existia e agora resolve (antes 404).
- **Texto oficial da cliente aplicado verbatim** (parágrafos de abertura + seção "Nossa História" + frase de destaque). Kicker "Quem somos" + `h1` "Desde 1982, distribuindo qualidade e confiança" (eco da `SITE_CONFIG.footerTagline`, já aprovada) — o título markdown original ("Quem Somos") vira o kicker/`metadata.title`.
- **Faixa de números** (`ABOUT_STATS`, array editável no topo do arquivo): +40 anos (desde 1982), +500 municípios, 3 estados (SP/MG/MS), +200 colaboradores, 3 unidades, frota própria. Ícones lucide (`History/MapPin/Map/Users/Building2/Truck`). Grid 2 col (mobile) → 3 col (`sm`).
- Cross-link: "três unidades estrategicamente localizadas" aponta para `ROUTES.units`. **CTA final** ("Vamos crescer juntos?") com botões "Ver produtos" (`ROUTES.products`) e "Nossas unidades" (`ROUTES.units`) — alinhado ao objetivo do site (gerar cotação). Frase de destaque em `blockquote` com borda `border-primary`.
- Layout: container `max-w-5xl`, prose em `max-w-3xl`, `text-balance` nos títulos, espaçamento generoso — consistente com as demais páginas.

Verificado: `type-check` + `lint` + Prettier limpos; render no navegador em **desktop e mobile (375px)** sem erros de console nem overflow (números em 2/3 colunas, CTA empilha no mobile), "Sobre" ativo no menu, título da aba "Quem Somos".

Pendências de conteúdo público: `/contato` ainda dá 404 (sem página — o link já foi removido do menu na Sessão 07); horário das unidades segue placeholder. Opcional oferecido: incluir uma imagem (fachada/equipe) na página Sobre quando a cliente enviar.

---

## 2026-07-10 — Home reforçada (prova social + segmentos + CTA)

A página inicial (primeiro contato) ganhou mais presença, mantendo o hero e o carrossel existentes. Conteúdo institucional estático no código.

- **Hero:** adicionado um selo ("Distribuidora de insumos desde 1982") acima do `h1` e `text-balance` no título. Copy do hero segue de `SITE_CONFIG.hero` (inalterada). Padding do topo levemente reduzido (`pt-20 lg:pt-24`) pelo conteúdo novo abaixo.
- **Faixa de números** — `components/home/home-stats.tsx` (Server Component, dados no array `HOME_STATS`): **+40** anos · **+9 mil** clientes · **+500** municípios · **+13 mi** de pessoas alcançadas. Valores **aproximados/estimados** fornecidos pela cliente (marcados como "+" para não cravar exatidão). Banda `border-y bg-muted/30`, grid 2 col (mobile) → 4 col (`lg`), ícones lucide (`History/Store/MapPin/Users`).
- **Segmentos atendidos** — `components/home/home-segments.tsx` (array `SEGMENTS`): Panificação, Confeitaria, Sorveterias, Food Service (público-alvo do CLAUDE.md), cada card com ícone (`Croissant/CakeSlice/IceCreamCone/UtensilsCrossed`) e **descrição em nível de segmento** (sem prometer produtos específicos). Cada card linka para `ROUTES.products`. Grid 1→2→4 colunas.
- **Carrossel de fornecedores** — mantido (só fornecedores com produtos ativos).
- **CTA de fechamento** — nova seção centralizada "Monte sua cotação e receba um atendimento ágil" com botões "Minha cotação" (`ROUTES.quote`) e "Ver produtos" (`ROUTES.products`), reforçando o objetivo do site.
- Sequência final: hero → números → segmentos → fornecedores → CTA. Bandas claras/muted alternadas para dar ritmo.

Verificado: `type-check` + `lint` + Prettier limpos; render no navegador em **desktop e mobile (375px)** sem erros de console nem overflow (números 2/4 col, segmentos 1/2/4 col, CTA empilha no mobile).

> ⚠️ **Números a confirmar com a cliente:** +9 mil clientes e +13 mi de pessoas são estimativas informadas verbalmente. Antes de publicar, validar os valores (e se ela quer exibi-los).

---

## 2026-07-11 — Cotação nos cards + stepper de quantidade + filtros visuais + busca por código

Rodada de melhorias de UX no catálogo público (nenhuma mudança de schema/DB).

### Botão "adicionar à cotação" nos cards + stepper de quantidade compartilhado

Supersede a pendência "botão adicionar à cotação nos cards da listagem".

- Novo `features/catalog/components/card-add-to-quote-button.tsx` (client) — botão compacto no `ProductCard`, reutiliza o **mesmo carrinho** (Context) do botão da página de detalhe. **`ProductCard` reestruturado**: o Link do detalhe e o botão de cotação viraram **irmãos** (HTML válido — nada de `<button>` dentro de `<a>`), card em flex-column com o botão fixo no rodapé.
- Novo primitivo compartilhado `components/shared/quantity-stepper.tsx` (`[−] n [+]`, controlado, puro): emite valor clampeado em `[min,max]`; remoção explícita via `onRemove` (o `[−]` no mínimo vira "Remover" quando o consumidor permite). Usado em **três lugares** (elimina duplicação): card (in-cart), detalhe (escolher qtd ao adicionar + editar in-cart) e `quote-item-list` (refatorado para o stepper compartilhado, lixeira separada mantida).
- Fluxo: card fora do carrinho = "＋ Adicionar" (1 clique, qtd 1); já no carrinho = stepper ligado ao carrinho. Detalhe fora do carrinho = stepper para escolher a qtd inicial + "Adicionar à cotação"; já no carrinho = stepper + "Ver minha cotação" + "Na sua cotação".

### Filtros do catálogo — redesenho visual (inspirado na referência de UX, sem copiar)

Substituídos os dois `<select>` nativos por navegação visual. Estado continua na URL (listagens compartilháveis).

- **Primitivo shadcn Select** criado (`components/ui/select.tsx`, dep. `@radix-ui/react-select`) — fica disponível para reuso no admin (os selects nativos do painel seguem inalterados por ora).
- **Chips de categoria** — `features/catalog/components/category-filter.tsx`: pílulas arredondadas, a ativa preenchida (`bg-primary`). Altura fixa `h-10`, `min-w-28` e `justify-center` — **padronizadas** (piso de largura; só o texto longo cresce). "Todas" limpa o filtro. Param `?categoria=`.
- **Carrossel de fornecedores com setas** — `supplier-section.tsx` reescrito: cards de logo roláveis na horizontal, setas ◂ ▸ que **só aparecem no overflow** (estado `canLeft/canRight` via listener de scroll/resize). Fornecedor ativo com ring; sem logo, cai no nome. Param `?fornecedor=`.
- **Busca com debounce** — `product-filters.tsx` (agora só busca + "Limpar filtros"): aplica sozinha ao parar de digitar (400ms), com guard anti-loop no `useEffect` (só faz push quando o termo diverge da URL). Largura reduzida no desktop (`sm:w-3/5 lg:w-1/2` ≈ 50%), 100% no mobile; "Limpar" à direita (`justify-between`).
- Página `produtos/page.tsx` orquestra: **busca → categorias → fornecedores** (empilhados), espaçamento apertado (`mb-6 space-y-4`) e cards de fornecedor menores (`h-16`) para a primeira linha de produtos subir.
- **Bug de layout corrigido:** o carrossel causava **scroll horizontal na página inteira** — a `<section max-w-7xl>` é flex-item de uma coluna e, com `min-width: auto`, crescia até a largura do conteúdo em vez de recortar (clássico "flexbox + filho com overflow-x-auto"). Corrigido com `w-full min-w-0` na section, então o `overflow-x-auto` interno passou a recortar. Verificado por DOM: `scrollWidth == clientWidth` em todos os breakpoints.

### Busca por nome **ou código (SKU)**

- `catalog-service.listPublicProducts`: adicionado `sku` ao `OR` da busca (já era `contains` + `mode: "insensitive"`, então herda o comportamento parcial/case-insensitive). Placeholder → "Buscar por nome ou código...". Verificado: `far-0`/`001` (só existem no SKU) trazem o produto; nome segue funcionando.

Verificação geral: `type-check` + `lint` + Prettier limpos; fluxos validados no navegador (público renderiza no preview) em desktop/tablet/mobile, sem overflow. Fornecedores/produtos temporários foram semeados para demonstrar o carrossel e **removidos depois** (banco restaurado ao seed).

---

## 2026-07-11 — Tabela nutricional (padrão ANVISA) + edição no painel

Feature **essencial** pedida pela cliente: cada produto pode ter sua tabela nutricional, no formato brasileiro atual (**ANVISA RDC 429/2020 + IN 75/2020** — colunas por 100 g/ml, por porção e %VD). **Construída em HTML/React/Tailwind (não é imagem).**

### Banco — migration `add_nutrition_facts` (aplicada, não-destrutiva)

- Enum `NutrientKind` (10 obrigatórios: ENERGY, CARBOHYDRATES, SUGARS_TOTAL, SUGARS_ADDED, PROTEIN, FATS_TOTAL, FATS_SATURATED, FATS_TRANS, FIBER, SODIUM + `OTHER`).
- `model NutritionFacts` (1:0..1 com `Product`, `onDelete: Cascade`): cabeçalho — `servingsPerPackage?`, `servingAmount`, `servingHousehold?`, `referenceAmount` (default "100 g"), `footnote?`. Back-relation `nutrition NutritionFacts?` no `Product`.
- `model NutritionRow`: `kind`, `label?`/`unit?` (editáveis por linha no painel — inclusive nos obrigatórios; nulo = usa o rótulo/unidade canônicos do código), `valuePer100`/`valuePerServing` (`Decimal(10,2)`, anuláveis), `dailyValuePercent` (`Int?`, nulo = sem VD, ex.: açúcares totais), `order`.
- **Decisão:** guardamos os valores **oficiais da embalagem como vêm** — nunca recalculamos (regras de arredondamento da IN 75/2020 são complexas). Nutrição é **opcional**: produto sem tabela não renderiza a seção.
- **Gotcha de deploy registrado:** ao adicionar models no Prisma, o dev server em execução mantém o client antigo em memória — é preciso **reiniciar o processo** após `prisma generate` (em produção: rodar `migrate deploy` + `generate` antes de subir).

### Feature `nutrition` (exibição)

- `constants/nutrition.ts` — `NUTRIENT_DEFINITIONS` (rótulo/unidade/ordem canônicos, fonte única) + `DEFAULT_NUTRITION_FOOTNOTE`.
- `services/nutrition-view.ts` — `buildNutritionView`: mapeia Prisma → view (**rótulo/unidade salvos têm prioridade**, caindo no canônico dos obrigatórios quando nulos; ordena obrigatórios na ordem oficial + extras depois; **formata Decimais em pt-BR** com vírgula via `toLocaleString`).
- `components/nutrition-table.tsx` — Server Component, `<table>` semântico (`caption`, `th scope`), faixa de título na **cor da marca** (`bg-primary`, não copiei o azul da referência), zebra sutil. **Rótulos alinhados à esquerda** (sem indentação — a cliente achou a indentação "torta") e **3 colunas de valor com largura fixa igual** (`table-fixed` + `colgroup` 17%) para leitura uniforme. Fonte responsiva (`text-sm sm:text-base`), `min-w-[20rem]` + `overflow-x-auto`. Faixa da porção com **"Porção" à esquerda e "Porções por embalagem" à direita** (`flex justify-between`, empilha no mobile — pedido da cliente para preencher o vazio à direita).
- `catalog-service.getPublicProductBySlug` inclui `nutrition: { include: { rows: true } }`.

### Layout da página de detalhe (iterado com a cliente até o formato final)

Reorganizado para hierarquia mais clara (inspirado na referência mdiasbranco, sem copiar):

- **Cabeçalho full-width** (categoria · fornecedor + título com `text-balance`).
- **Grade 40/60** (`lg:grid-cols-[2fr_3fr]`): **esquerda** = galeria + cotação (sob a imagem) + código(SKU)/embalagem/ficha; **direita** = tabela nutricional, ao lado do produto.
- **"Detalhes do Produto"** (descrição) movido para **baixo**, full-width.
- Fallback: produto **sem** tabela cai no layout clássico (galeria | infos), sem coluna vazia. Blocos extraídos (`gallery`/`quoteButton`/`productSpecs`) para não duplicar.

### Edição no painel — embutida no produto (decisão da cliente)

Cada produto tem suas especificações → a edição vive **junto do produto**, com um toggle "tem tabela?". Marcou, preenche; não marcou, produto fica sem tabela.

- `product-schema.ts`: `nutrition` opcional dentro do `productSchema` (objeto anulável; `null` = sem tabela). `nutritionRowSchema`/`nutritionSchema` com valores anuláveis.
- `product-actions.ts`: lê o hidden field `nutrition` (JSON, mesmo padrão das imagens); exige a porção quando a tabela está ligada (`actionError` de topo).
- `product-service.ts`: `buildNutritionCreate` (descarta linhas sem nenhum valor; guarda rótulo/unidade de **qualquer** linha); create com `nutrition: { create }` aninhado; update reconcilia dentro da `$transaction` (`nutritionFacts.deleteMany` + recria — sem tabela na entrada = remove a existente). `getProductById` inclui a nutrição.
- `features/product/components/nutrition-form-section.tsx` (client): toggle + campos de porção + linhas de nutriente. **Nome e unidade são editáveis em toda linha** (inclusive obrigatórios — a exibição usa o editado e cai no canônico se vazio); **toda linha é removível**; o seletor **"Adicionar nutriente"** (optgroup) oferece de volta os obrigatórios removidos ou um personalizado. Ao **editar**, mostra só os nutrientes salvos (removidos ficam removidos); em produto novo/fresh começa com os 10 obrigatórios em branco (`buildInitialRows` + `sortRows` mantêm a ordem oficial via `kind`). Serializa em JSON no hidden input. Integrado ao `ProductForm`; a edição pré-carrega os valores salvos.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Service testado por script `tsx`** (com `--env-file` p/ carregar env antes dos imports com `@/`): gravar tabela → linha vazia (Sódio) **descartada**, extra "Cálcio" (OTHER) salvo; desligar toggle → tabela **removida**; restaurar as 12 linhas da demonstração.
- **Público no navegador:** página de detalhe renderiza a tabela (12 linhas, decimais em vírgula, %VD em branco onde não há VD), layout 40/60, sem overflow (desktop/mobile).
- **Render do form admin não verificado no preview** (painel exige login; cookie cross-site cai no `/login` — limitação já registrada); escrita validada por script, como as demais telas do painel.

Dados de dev: a tabela de exemplo (valores da imagem da cliente) está semeada no produto "Farinha de Trigo Tipo 1 Premium" — editável/removível pelo painel.

Pendências/observações:

- A referência mostrava campos que **não existem no modelo** (Validade, Peso líquido, Benefícios, Atributos, Regiões, "Receitas relacionadas") — ficam como evolução separada (novos campos em `Product` + Recipe reativada) se a cliente quiser.
- No mobile, os 2 rótulos mais longos da tabela quebram em 2 linhas (inevitável a 375px; legível).

---

## 2026-07-12 — Limpeza de código não utilizado (dead code)

Varredura de código morto com `knip` (via `npx`, sem instalar como dependência) + verificação manual (grep) de cada item para evitar falso positivo. Nenhuma mudança de schema/DB/comportamento.

Removido (código-fonte genuinamente sem referência, nem interna):

- `utils/format.ts`: funções `formatCurrency` e `formatDate` (ninguém importava).
- `types/pagination.ts`: **arquivo inteiro** removido — `PaginationParams`, `PaginatedResponse`, `DEFAULT_PAGE`, `DEFAULT_PER_PAGE` não eram importados por ninguém (só reexportados pelo barrel). Removida também a linha `export * from "./pagination"` de `types/index.ts`.
- `types/action.ts`: tipo `ActionSuccess` (não usado; `ActionResult` e `ActionFailure` seguem em uso).

Dependências mortas desinstaladas (`npm uninstall`):

- `framer-motion` — nenhum arquivo importava; só aparecia como dica em `next.config.ts` (`optimizePackageImports`), agora ajustado para `["lucide-react"]`. As animações do site são via CSS (`tw-animate-css` + keyframe `marquee` no `globals.css`), não JS. **Removida da lista de stack acima.** Se um dia precisar de animação em JS, reinstalar.
- `@radix-ui/react-dropdown-menu` — sem nenhum import no projeto.
- `tailwindcss-animate` — o `globals.css` usa `tw-animate-css` (outro pacote); o `tailwindcss-animate` estava órfão.

Mantidos de propósito (o knip marca, mas **não** é dead code):

- `pg` + `@types/pg` — peer de runtime do `@prisma/adapter-pg` (usado indiretamente pelo `PrismaPg`); nunca importados direto, mas obrigatórios.
- `@typescript-eslint/*` e `eslint-config-next` — consumidos via `FlatCompat` (`next/core-web-vitals`, `next/typescript`) no `eslint.config.mjs`.
- `components/ui/select.tsx` + `@radix-ui/react-select` — primitivo shadcn adicionado de propósito para reuso futuro no admin (Sessão 11); decisão da cliente foi manter.

Não mexido (é uso interno, não código morto): vários "unused exports" do knip são símbolos usados **dentro do próprio arquivo** (`formatCPF`/`formatCNPJ`, `ADMIN_NAV_ITEMS`, `USER_ROLES`, `quoteItemSchema`, `isUploadPathInUse`, `UPLOAD_FOLDERS`) ou API de primitivos shadcn (`buttonVariants`, `SheetClose`, `DialogClose`). Só a palavra `export` é mais ampla que o necessário — não é dead code; deixado como está para não gerar churn/risco.

Verificado: `type-check` + `lint` limpos; `knip` reexecutado confirma que os itens saíram (só permanecem os mantidos de propósito acima).

---

## 2026-07-12 — Limite de upload de imagem: 5 MB → 20 MB

A cliente não conseguia cadastrar produtos com fotos de ~15 MB (erro "Imagem muito grande"). O único teto era o do servidor.

- `lib/storage/index.ts`: novo `MAX_IMAGE_MB = 20` como **fonte única**; `MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024`. (Antes: 5 MB hardcoded.)
- `app/api/admin/upload/route.ts`: mensagem de erro agora **deriva de `MAX_IMAGE_MB`** (`Imagem muito grande (máximo ${MAX_IMAGE_MB} MB).`) — nunca mais desatualiza. Os componentes de cliente (`image-upload`/`single-image-upload`) não validam tamanho; só exibem a mensagem do servidor.
- Em `next dev` (Route Handler) não há limite de body do Next além do nosso — subir a constante já resolve em desenvolvimento.

⚠️ **Deploy (Nginx):** o `client_max_body_size` padrão do Nginx é **1 MB** e bloquearia o upload antes de chegar no app — em produção é **obrigatório** aumentar (ex.: `client_max_body_size 25M;` no `server`/`location`) senão nem os 5 MB antigos passariam. O `.conf` do Nginx fica na VPS (não versionado no repo).

Recomendação registrada: 15–20 MB por foto de produto é grande para web; o ideal futuro é redimensionar/comprimir no upload (o `next/image` já otimiza na entrega, mas o arquivo bruto ocupa disco na VPS). Fica como melhoria opcional.

Verificado: `type-check` + `lint` limpos. Fluxo de upload em si não testável no navegador do preview (painel exige login; cookie cross-site — limitação já registrada); a mudança é de constante/mensagem, conclusiva por type-check.

---

## 2026-07-12 — Ajustes de cadastro de produto + Sabores/variações + Unidade de venda

Rodada pedida durante o cadastro de produtos reais. Cinco frentes; as quatro primeiras são de UI (sem banco), a última é uma feature completa com migração.

### Ajustes de UI no cadastro (sem schema)

- **Nutrição — botão em vez de select:** o `<select>` "Adicionar nutriente" virou um **botão** (`Plus` "Adicionar nutriente") que acrescenta uma linha em branco (nome/unidade livres). Removidos `addSelection`/`availableMandatory`/`handleAdd` de `nutrition-form-section.tsx`. Nutriente removido volta digitando o nome (toda linha já tinha rótulo/unidade editáveis).
- **Nutrição — navegação Enter/Tab:** um `onKeyDown` no contêiner da tabela (`fieldsRef`) faz **Enter percorrer os campos na ordem do DOM (= ordem visual)** em vez de enviar o formulário — era o `Enter` submetendo o form que fazia o foco "pular" para longe (validação/topo). Tab já seguia a ordem do DOM.
- **Campos obrigatórios com `(*)`:** marcador `<span className="text-destructive">*</span>` em Nome, Descrição, Categoria (`product-form.tsx`), Porção (`nutrition-form-section.tsx`) e Unidade de venda.
- **Ficha Técnica removida:** campo `technicalSheetUrl` retirado do formulário (seção "Ficha técnica e SEO" → só **"SEO"**), do Zod (`product-schema.ts`), da action, do service, da página de edição e do link na página pública de detalhe. A **coluna `Product.technicalSheetUrl` foi dropada** na migração abaixo (a cliente usa só "Detalhes do Produto"/descrição).

### Sabores/variações + Unidade de venda (feature nova)

Decisões da cliente (confirmadas): cada **sabor tem foto própria** (carrossel/seleção na página do produto); o cliente pode pedir **vários sabores do mesmo produto, com quantidade por sabor**; **unidade de venda por produto** (ex.: caixa/unidade), exibida junto da quantidade na cotação.

**Banco — migração `20260712133602_flavors_sale_unit_remove_techsheet`** (gerada por `migrate diff --from-config-datasource` + aplicada com `migrate deploy`, pois o modo interativo do `migrate dev` não roda no ambiente):

- `Product.saleUnit String @default("unidade")` (backfill dos produtos existentes para "unidade").
- Novo model **`ProductFlavor`** (`id, name, imageUrl?, order, productId`, `onDelete: Cascade`) + `Product.flavors`.
- `QuoteItem.flavor String?` e `QuoteItem.unit String?` — **snapshots** (nome do sabor + unidade no momento do envio, preservam histórico). Unique trocado de `[quoteId, productId]` para **`[quoteId, productId, flavor]`** (um produto pode ter várias linhas, uma por sabor).
- `Product.technicalSheetUrl` **dropado**. SQL revisado antes de aplicar; sem risco de conflito (cotações atuais já eram únicas por quoteId+productId). Após migrar: `prisma generate` (lembrar de **reiniciar o dev server** — gotcha já registrado).

**Admin (cadastro):** `product-schema.ts` ganhou `saleUnit` e `flavors[]` (`productFlavorSchema`: nome obrigatório + `imageUrl` opcional). Campo **"Unidade de venda"** (input com `datalist` de sugestões) e nova seção **"Sabores"** (`flavor-form-section.tsx` — nome + upload de foto por sabor, adicionar/remover; upload controlado inline usando a pasta `flavors`). Action extrai `saleUnit` + JSON de `flavors`; service cria/recria os `ProductFlavor` na transação e **limpa fotos órfãs** no update/delete (pasta `flavors` adicionada a `UPLOAD_FOLDERS` e à checagem de `cleanup.ts`). `getProductById` inclui `flavors`.

**Público:** `catalog-service` traz `saleUnit` + `flavors` no detalhe e `saleUnit` + `_count.flavors` na listagem. Novo **`flavor-quote-picker.tsx`** (grade de sabores: foto + nome + controle de cotação por sabor). Página de detalhe: produto **com** sabores mostra o seletor; **sem** sabores mostra o botão único (`add-to-quote-button.tsx`, agora com a unidade). No card da listagem (`card-add-to-quote-button.tsx`): produto com sabores vira link **"Escolher sabor"** (não dá para escolher no card).

**Carrinho:** `quote-cart-context.tsx` reescrito para **múltiplas linhas por produto** — identidade `productId + flavorId`; `QuoteCartItem` ganhou `flavorId`/`flavorName`/`unit`; API `addItem/removeItem/setQuantity/isInCart` passou a receber `flavorId`. `quote-item-list` mostra sabor + "Vendido por <unidade>".

**Envio/cotação:** `itemsJson` inclui `flavorId`; `quote-schema` aceita `flavorId`; **o service resolve nome do sabor + unidade a partir do banco** (fonte da verdade — descarta linha se o sabor não existe mais) e grava snapshot em `QuoteItem.flavor/unit`; dedup por produto+sabor. E-mail (comercial + cliente) e a tela de detalhe do admin passaram a exibir "Produto — Sabor" e "N unidade".

**Verificação:** `type-check` + `lint` + Prettier limpos. **Script `tsx`** (criar produto com 2 sabores + `saleUnit`, ler pelo serviço público, criar cotação com 2 sabores, conferir snapshots `flavor`/`unit` no `QuoteItem`) — todos os checks passaram, com **restauração do banco** (produto/cotação removidos e contador de protocolo `quote_sequence` restaurado ao valor anterior). Público conferido no navegador: card "Escolher sabor" e detalhe com "Escolha os sabores" + botão por sabor (DOM via JS; o painel de preview estava com o glitch de composição já registrado — `innerText` travado, mas o DOM real correto). Interatividade do cliente (clicar adicionar) e telas do admin não são exercitáveis no preview (hidratação/login) — validadas por type-check + script, como de praxe.

Pendências/observações:

- Layout do seletor de sabores é uma **grade** responsiva (2/3 colunas), não um carrossel deslizante — mostra todos os sabores de uma vez (melhor para escolher). Fácil trocar por carrossel se a cliente preferir.
- Carrinhos antigos no `localStorage` (formato sem `flavorId`/`unit`) são lidos com tolerância (viram linha sem sabor, unidade vazia).

---

## 2026-07-14 — Carrossel de sabores, tabela nutricional por sabor e enxugamento do cadastro

Rodada pedida pela cliente durante o cadastro de produtos com muitos sabores. Quatro frentes; a segunda exigiu migração de banco.

### 1. Carrossel horizontal de sabores (supersede a grade da Sessão 12)

- O antigo `flavor-quote-picker.tsx` (grade) foi **substituído** por `features/catalog/components/flavor-product-view.tsx` (client) — carrossel horizontal com setas ◂ ▸ (mesmo padrão do `supplier-section`: setas só aparecem no overflow, `scroll-snap`, scrollbar oculta). Resolve o problema de produtos com >3 sabores ocupando espaço vertical.
- Cada card de sabor mantém foto + nome + controle de cotação próprio (o que a cliente já gostava): fora do carrinho vira "＋ Adicionar", já no carrinho vira o `QuantityStepper`. Multi-sabor no carrinho segue igual (`productId + flavorId`).

### 2. Tabela nutricional por sabor (feature nova — migração `nutrition_per_flavor`)

Alguns produtos (ex.: barrinhas) têm valores nutricionais diferentes por sabor. Decisão da cliente: **uma tabela por sabor** (não "tabela padrão + exceções"), com botão "copiar do sabor anterior".

- **Banco (migração não-destrutiva `20260714202435_nutrition_per_flavor`):** `NutritionFacts.productId` passou a **opcional** e ganhou `flavorId String? @unique` + relação `ProductFlavor.nutrition NutritionFacts?` (`onDelete: Cascade`). A tabela pertence a **exatamente um dono** — produto (sem sabores) OU sabor —; a aplicação garante que só um é gravado. Linhas existentes (nível do produto) intactas. Gerada por `migrate diff --from-config-datasource` + `migrate deploy` + `prisma generate` (reiniciar o dev server — gotcha já registrado).
- **Modelo tabela geral + override por sabor (fallback):** a tabela do **produto** é a **tabela geral**; cada sabor pode ter a **sua própria**, que a substitui. No público, o sabor selecionado exibe a sua tabela ou, na falta dela, cai na geral. Isso **preservou o dado real** de produtos que já tinham tabela do produto + sabores (ex.: "Barrinha Ruby" tinha 14 linhas no nível do produto e 4 sabores sem tabela — a tabela sumiria no layout inicial que ignorava a do produto; corrigido nesta mesma sessão). Nota: na pergunta inicial a cliente escolheu "uma tabela por sabor", mas o dado real exigia o fallback para não se perder; o override por sabor continua disponível.
- **Público:** ao selecionar um sabor no carrossel, o `FlavorProductView` **troca a tabela nutricional** exibida ao lado (estado no cliente; sabor default = o primeiro). `displayedNutrition = sabor.nutrition ?? productNutrition`. Layout 40/60 quando há **qualquer** tabela (geral ou por sabor); senão, layout clássico (galeria | sabores). Aviso discreto só quando há tabela por sabor em algum sabor, mas o selecionado não tem e não há geral. As `NutritionView` (dos sabores e a geral) são montadas no servidor (`buildNutritionView`) e passadas como dados planos ao componente client, que renderiza o `NutritionTable` (apresentacional).
- **Painel:** cada sabor tem a sua tabela (na `FlavorFormSection`): toggle "este sabor tem tabela" + editor + **"Copiar do sabor anterior"**. A seção de tabela do **produto** **continua sempre visível**; quando há sabores, ela é rotulada **"Informação nutricional geral"** com uma nota explicando que é o fallback (coordenado via `onCountChange` → `flavorCount` → prop `hasFlavors` no `NutritionFormSection`).
- **Refatoração:** o editor de nutrição (porção + linhas + Enter/Tab) foi extraído para `features/product/components/nutrition-fields.tsx` (controlado; helpers `emptyNutritionData`, `nutritionDataFromRows`, `serializeNutritionData`), reutilizado pela tabela do produto (`nutrition-form-section.tsx`) e pela de cada sabor. `features/product/utils/nutrition-form-data.ts` mapeia o registro salvo → valores do formulário na edição.
- **Service (`product-service.ts`):** `buildNutritionCreate` retorna dados sem a relação de dono (`Omit<..., "flavor">`), servindo produto e sabor; `buildFlavorsCreate` monta cada `ProductFlavor` com a nutrição aninhada. A tabela do produto (geral) é **sempre preservada** (não é mais ignorada quando há sabores). No update, as tabelas por sabor somem junto dos sabores (cascade) e a geral é substituída pelo `deleteMany({ productId })` + recriação.
- **Validação:** a porção continua obrigatória em qualquer tabela ativa — do produto **ou** de um sabor (helper `validateNutritionServings` na action, com o nome do sabor na mensagem).

### 3. Só uma descrição no cadastro

- Removido o campo **"Descrição curta"** do formulário, do `productSchema` (Zod), da action, do service (create/update) e das páginas novo/editar. Também deixou de ser exibido no `ProductCard` e no cabeçalho da página de detalhe, e saiu da busca (`catalog-service`) e do `select` da listagem. **A coluna `Product.shortDescription` foi mantida no banco** (não-destrutivo) — fica órfã/ignorada.

### 4. Meta título/descrição removidos do painel (SEO automático)

- Removida a seção **SEO** do formulário (campos `metaTitle`/`metaDescription`), do `productSchema`, da action e do service. **Colunas mantidas** no banco. O SEO da página de produto segue **automático**: `generateMetadata` usa `metaTitle ?? name` e `metaDescription ?? metaSummary(description)` (novo resumo de ~155 chars derivado da descrição) — valores meta legados, se existirem, ainda têm prioridade; nada novo é gravado neles.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Service testado por script `tsx`**: produto ACTIVE com 2 sabores, cada um com tabela distinta (400 vs 360 kcal) — `getProductById` (admin) e `getPublicProductBySlug` (público) trazem a nutrição por sabor; `buildNutritionView` confirma que as tabelas diferem. Produto de teste **removido** ao final.
- **Navegador (público renderiza no preview):** página de detalhe do produto com sabores — carrossel exibido; selecionar "Bolo de Cenoura" troca a tabela (400→360 kcal, "1,5" em pt-BR); "Adicionar" transforma o card em stepper e mostra "Ver minha cotação (1 sabor)"; mobile (375px) empilha sem overflow horizontal (`scrollWidth == clientWidth`). Render do form admin não exercitável no preview (login/cookie cross-site — limitação já registrada); escrita validada por script.

Pendências/observações:

- O aviso "Este sabor não tem tabela nutricional cadastrada" aparece quando o produto tem sabores com tabela mas o sabor selecionado não tem a sua — comportamento intencional.
- Seguem abertas as pendências de produção (domínio/e-mails oficiais → Resend → senha do admin → deploy) e a página `/contato` (404). Confirmar números da home (Sessão 10) e horário das unidades (Sessão 07).
- Lembrete de deploy: rodar `migrate deploy` + `generate` no servidor antes de subir (a nova migração `nutrition_per_flavor` precisa ser aplicada).

### Limpezas internas (mesma sessão, sem impacto visível)

- **Código morto introduzido nesta sessão removido:** `nutritionDataFromRows` e `sortRows` (helpers exportados em `nutrition-fields.tsx` que não chegaram a ser usados — a edição carrega via `toNutritionFormData`) e o re-export `NutritionRowValue` em `nutrition-form-section.tsx` (ninguém importava).
- **`CompanyUnit.name` removido** (`constants/units.ts`) — sem uso no display desde a Sessão 07 (o card usa "Cidade - UF"); tipo + as 3 entradas. Verificado que `unit-card.tsx`/página não referenciam.
- **Seed enxuto** (`prisma/seed.ts`): removidas as 5 chaves órfãs de `Settings` (`site_name`, `site_description`, `home_hero_title`, `home_hero_subtitle`, `home_hero_image`) — nome/descrição/hero vivem no `SITE_CONFIG` (código) desde a Sessão 08. O seed agora cria só as 8 chaves editáveis (contato, redes, e-mails de cotação). Só afeta ambientes novos; linhas órfãs em bancos existentes são inofensivas (ignoradas).
- `knip` reexecutado: o restante do relatório é idêntico ao baseline já revisado na Sessão 12 (itens mantidos de propósito: `components/ui/select.tsx` + `@radix-ui/react-select`, `pg`/`@types/pg`, `@typescript-eslint/*`, `eslint-config-next`, e exports "amplos" de primitivos shadcn / API interna). Nada novo a remover.
- Verificado: `type-check` + `lint` + Prettier limpos; seed roda (8 configurações); páginas `/nossas-unidades` e `/produtos/barrinha-ruby` renderizam sem erro (tabela nutricional presente, 4 sabores).

### Animação de hover nos cards do catálogo (inspirada na referência)

- `features/catalog/components/product-card.tsx`: ao passar o mouse, o card **sobe** (`-translate-y-1`), ganha **sombra** (`shadow-lg`), a **imagem dá zoom** (`group-hover:scale-105`) e a **borda** assume a cor da marca (`hover:border-primary/40`); título vai a `text-primary`. Transição suave `duration-300 ease-out`. O `group` foi movido do `<Link>` para o `<article>` para o card inteiro reagir (não só a área do link).
- **Inspiração, não cópia:** a referência (mdiasbranco) preenche o card com a cor da marca de baixo p/ cima no hover — funciona lá porque as imagens são recortes sobre fundo transparente. Os cards da Mira usam fotos full-bleed (`object-cover`), então o preenchimento colorido não caberia; adaptei para elevação+sombra+zoom, alinhado à regra "animações discretas" do projeto. O tema é neutro (sem token vermelho; a cor da marca vive só no logo), então o acento de borda/título é sutil de propósito.
- Verificado no navegador (hover computado): `translate: 0 -4px`, `shadow-lg` ativo, `img scale: 1.05`, borda em `primary/40`.
- **Decisão da cliente (2026-07-14):** a identidade visual ainda vai mudar; ao definir a paleta da marca, **revisitar** este hover e demais acentos que hoje usam `primary` neutro (dar mais cor). O modo escuro entra junto dessa lapidação (ainda falta `public/logo-mira-dark.png`).

---

## 2026-07-15 — Identidade visual da marca aplicada (direção "Moderno")

Supersede a pendência "identidade visual em evolução" (tema era neutro/cinza). A cliente definiu a paleta e forneceu um pacote de arquivos prontos (pasta externa `C:\Projeto\codigo-mira`, com `COMO-APLICAR.md`). Os arquivos foram **comparados um a um** com os atuais antes de aplicar — vários sobrescreviam trabalho aprovado ou traziam dados errados; apliquei o visual **corrigindo** esses pontos.

### Fundação (recolore o site inteiro via tokens)

- `app/globals.css`: `--primary` = **azul da marca `#17479e`** (botões, links, nav ativo, `--ring` de foco); novo token **`--brand` = vermelho `#ed1c24`** (exposto como `bg-brand`/`text-brand-foreground`, para CTAs de conversão); `--accent` = azul-claro `#eaf0fb`; `--radius` 0.5→**0.75rem**. Tokens `.dark` também atualizados para a marca (dark ainda não ativado). `--font-mono` preservado (Geist Mono).
- `app/layout.tsx`: fontes Geist → **Public Sans** (corpo, `--font-sans`) + **Archivo** (títulos, utilitário `font-display` via `--font-display`).
- `components/layout/main-nav.tsx`: item ativo em `text-primary font-semibold`.

### Layout "Moderno"

- `app/(public)/page.tsx` (home): hero de 2 colunas, CTA vermelho (`bg-brand`), selo, provas rápidas, nova seção "Como funciona a cotação" (`components/home/home-how-it-works.tsx`, novo) e CTA final em faixa azul. **Ajuste meu:** não existe `/public/hero-cozinha.jpg` — troquei o `<Image>` por um placeholder "Imagem em breve" (sem imagem quebrada), com o trecho do `<Image>` comentado pronto para quando a foto existir. Removido o `import Image` ocioso.
- `components/layout/site-header.tsx`: barra utilitária azul no topo (desktop). **Ajustes meus:** (1) o componente virou **async** e lê o **telefone real das Settings** (`getSiteSettings().contactPhone`) em vez do placeholder `(00) 0000-0000`; (2) no lugar de "Área do cliente ↗" (que expunha o login do painel de forma enganosa — o site público não tem login de cliente), há um **ícone de engrenagem discreto** (`lucide Settings`, `aria-label="Painel administrativo"`) → `ROUTES.admin.login` (`/login`). Decisão da cliente.
- `components/home/home-stats.tsx`: faixa de números estilo editorial (serifa via `font-serif` — cai na serifada do sistema, `--font-serif` não mapeado; rótulos em `font-mono` maiúsculo) sobre faixa azul.
- `app/(public)/sobre/page.tsx`: hero azul da marca com acento vermelho, números em grade, história em 2 colunas, blockquote com barra vermelha, CTA final. Sem erros factuais (mantém 3 unidades / +500 municípios / +200 colaboradores).
- `app/(public)/nossas-unidades/page.tsx` + `components/institutional/unit-card.tsx`: cabeçalho centralizado, faixa de cobertura azul com CTA, matriz destacada em azul. **Correções minhas:** restaurei o título **`Cidade - UF`** no card (o pacote reverteu para só a cidade — decisão aprovada na Sessão 07) e a **ordenação da matriz primeiro** na página (o pacote usava a ordem crua de `COMPANY_UNITS`).

### Correção de conteúdo (dados reais)

- **Números da cliente mantidos como no design** (decisão dela): `+9 mil` clientes, `+2.500` itens, `48h` de entrega na `home-stats`; e as provas rápidas do hero (`Entrega em até 48h`, `+2.500 itens`, `Nota fiscal`). **Ainda não confirmados** — validar antes de publicar (mesma pendência dos números da Sessão 10).
- **`5 unidades` → `3 unidades`** corrigido nos dois lugares (barra do header e `home-stats`) porque contradizia as **3 unidades reais** listadas em `/nossas-unidades` e na página Sobre. A barra do header agora diz "3 unidades no interior de São Paulo".

### Não aplicado de propósito

- `codigo-mira/app/(public)/unidades/page.tsx` — **não copiado** (criaria rota duplicada `/unidades`; a rota real é `/nossas-unidades`, como o próprio `COMO-APLICAR.md` confirma).
- Pendências oferecidas pelo pacote (`COMO-APLICAR.md`, seção 6) e **não** feitas nesta rodada: botão "+ Cotação" no card do catálogo, página de produto com specs em cartões, filtros com shadcn `Select`. (Obs.: cotação no card e filtros já foram entregues em sessões anteriores — 08/11.)

### Verificação

- `type-check` + `lint` limpos.
- **Navegador (público renderiza no preview):** tokens ativos (`--primary #17479e`, `--brand #ed1c24`); barra do topo com telefone real `(19) 3638-2200` + engrenagem → `/login` (sem "Área do cliente"); `/nossas-unidades` com 3 cards, matriz primeiro, títulos `Cidade - UF`; `/sobre` com hero azul; **sem erros de console**. Mobile 375px: barra utilitária some (`display:none`), sem scroll horizontal (`scrollWidth == clientWidth`).

### Pendências / próximos

- **Assets de imagem:** `/public/hero-cozinha.jpg` (home). Opcionais (hoje divs vazias, não quebram): `/public/sobre-mira.jpg` e `/public/historia-mira.jpg` na página Sobre.
- **Números a confirmar com a cliente:** `+9 mil` clientes, `+2.500` itens, `48h` de entrega (marketing, ainda não validados).
- **Modo escuro:** tokens `.dark` já na paleta da marca, mas o modo segue desativado; falta `public/logo-mira-dark.png` e o `next-themes`. Sidebar do admin não recebeu a barra utilitária (só o site público).

---

## 2026-07-16 — Home alinhada ao mockup "Moderno" (código-mira) + botões, rodapé escuro e fix de largura da faixa

Rodada de refino da **página inicial** para seguir o mockup do pacote `codigo-mira` (direção "Moderno"), guiada pela cliente. Sem mudança de schema/DB.

### Botões mais encorpados (site inteiro)

- `components/ui/button.tsx`: `size` `default` `h-9`→**`h-10`** (px-4→px-5), `lg` `h-10`→**`h-12` + `text-base`**, `icon`/`sm` ajustados. CTAs do hero ganharam `font-semibold`.

### Hero

- **Ponto final vermelho** no `h1` (`{title}<span className="text-brand">.</span>`).
- Botão primário **"Ver catálogo →"** (vermelho `bg-brand`, com `ArrowRight`), secundário "Minha cotação" (outline). Ambos `rounded-full`.
- Provas rápidas: removidas "Entrega em até 48h" e "Nota fiscal" (decisão da cliente); ficaram **+40 anos de mercado · +2.500 itens · Atendimento especializado**.

### Cabeçalho

- **Botão "Minha cotação" agora vermelho** (`bg-brand`, pílula) — `quote-cart-button.tsx`. Badge branco por cima segue legível.
- **Ícone de busca** no header (desktop) → `ROUTES.products` (`site-header.tsx`).

### Seção "Compre por segmento" (reescrita — `components/home/home-segments.tsx`)

- Cabeçalho com título + link **"Ver todas as categorias →"**; subtítulo "Encontre rápido o que seu negócio precisa.".
- 4 cards (Panificação, Confeitaria, Sorveterias, Food Service) com **placeholder de imagem neutro** (`ImageIcon`), nome, linha de exemplos e **"Explorar →"**. Cada card leva a `/produtos?categoria=<slug>`.
- **Pendência mantida:** os slugs (`panificacao`, `confeitaria`, `sorveteria`, `food-service`) **não batem** com as categorias reais do catálogo (hoje: Farinhas, Fermentos e Leveduras, Suplementos). Clicar cai em listagem vazia até alinhar. Decisão de de-para segue **em aberto com a cliente** (perguntado; ela adiou). Ajuste é de uma linha por segmento no `SEGMENTS`.

### Ordem da home + remoções (para bater com o mockup)

- Nova sequência: **hero → segmentos → como funciona → faixa azul de números → rodapé**. `page.tsx` virou síncrono (não busca mais fornecedores).
- **Removidos da home:** o carrossel **"Grandes marcas parceiras"** (era o `SupplierCarousel` — a cliente apontou que "são fornecedores"; o mockup não o tem) e o **CTA azul final** (duplicava a conversão; ausente no mockup). Fornecedores seguem acessíveis pelo filtro do catálogo.

### Rodapé escuro (`components/layout/site-footer.tsx`)

- Fundo **`bg-slate-900`** com **faixa vermelha** (`bg-brand h-1`) no topo, como o mockup. Colunas Marca (5) / Navegação (3) / Contato (4), redes em pílulas, contato com ícones, barra inferior.
- **Logo em branco** via `brightness-0 invert` sobre `logo-mira.png` (não há `logo-mira-dark.png` dedicado ainda). Deixei de usar o componente `Logo` aqui (ele renderiza o logo colorido, ilegível no escuro).
- lucide 1.x **não exporta** ícones de marca (`Facebook`/`Instagram`) — redes ficaram como **pílulas de texto** (tentativa inicial com esses ícones quebrou em runtime; corrigido).

### Faixa de números (`components/home/home-stats.tsx`) — bug de largura corrigido

- Conteúdo: removido "48h/entrega"; entrou **"+40 · Anos de experiência"** (dado real). Ordem: +40 · +9 mil · 3 · +2.500.
- Dimensões conforme mockup: `rounded-[22px]`, padding **44px/46px** (`py-11 lg:px-[46px]`), números `text-[40px]`, faixa horizontal.
- **Bug de layout importante (registrar):** a `<section>` usa `mx-auto` e é **flex-item** do layout público (`app/(public)/layout.tsx` → `flex flex-col`). Margem `auto` no eixo cruzado do flex **cancela o `align-items: stretch`**, então a seção encolhe até a **largura do conteúdo** (números curtos ⇒ ~757px) e **ignora o `max-w-*`** — por isso trocar `max-w-6xl`↔`7xl` não surtia efeito. **Fix:** adicionar **`w-full`** à section (largura definida ⇒ preenche o container, respeita `max-w-7xl`). Agora a faixa alinha exatamente com a seção "Como funciona" e os cards (left 24 / right 1241 / 1217px em viewport 1280). As outras seções escapavam do bug só por terem conteúdo largo — a correção idiomática delas é a mesma (`w-full`) se um dia ficarem estreitas.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Navegador (dev server próprio, público renderiza):** console **sem erros** (os erros de `SiteFooter` vistos durante a rodada eram resíduo da versão com `Facebook/Instagram`; sumiram após restart + limpeza de `.next/cache/webpack`); segmentos, "Como funciona", faixa azul e rodapé escuro renderizando; links de segmento = `/produtos?categoria=<slug>`; **sem overflow horizontal** em desktop (1280) e mobile (375); largura da faixa medida por `getBoundingClientRect` batendo com a seção "Como funciona".

### Ajustes finais (mesma rodada)

- **Faixa de números — fonte igual à do corpo:** a `home-stats` deixou de usar a serifada (`font-serif`) nos valores e a mono (`font-mono`) nos rótulos; agora tudo usa **Public Sans** (`--font-sans`, mesma fonte do corpo) — valores em `font-bold`, rótulos em `uppercase`/`tracking`. Pedido da cliente ("coloca a mesma que tem no corpo do site"), só nessa faixa.
- **Selo do hero removido:** tirado o badge "Distribuidora de insumos food service" do topo do hero (`app/(public)/page.tsx`) a pedido da cliente. O hero começa direto no `h1`.
- **Barra utilitária (topo) — largura total, sem telefone:** a barra deixou de ser presa ao container central (`max-w-7xl`) e passou a **largura total** (`w-full px-6 lg:px-10`), afastando as infos para perto das bordas (unidades à esquerda, engrenagem do painel à direita), a pedido da cliente. Removidos o **telefone** e o texto "Atendimento B2B e varejo" (+ separador). Como o telefone era o único uso de `settings`/`getSiteSettings`/`onlyDigits` no `site-header.tsx`, esses imports saíram e o componente **deixou de ser `async`**.
- Verificado no navegador (após um travamento momentâneo do preview/CDP, resolvido com restart do dev server): faixa com a fonte do corpo, hero sem o selo, barra do topo em largura total sem telefone; `type-check` + `lint` + Prettier limpos.

### Pendências / próximos (desta rodada)

- **De-para segmento → categoria** (aberto com a cliente).
- **Fornecedores na home:** removidos conforme mockup; se a cliente quiser mantê-los, reintroduzir **rotulados "Fornecedores"** (não "Grandes marcas parceiras").
- Seguem as pendências anteriores: assets de imagem (hero), números de marketing a confirmar, modo escuro, `/contato` (404).

---

## 2026-07-17 — Busca global no cabeçalho (autocomplete) — única entrada de busca do site

Centralizada **toda a busca textual na lupa do cabeçalho** (ao lado do CTA "Minha cotação"), com **sugestões em tempo real**. O catálogo passou a cuidar **só de filtros** (categoria, fornecedor). Decisões da cliente: clicar em qualquer sugestão leva ao **catálogo já filtrado**; busca de produto por **nome + código (SKU)**.

### O que a busca faz

- Autocomplete enquanto digita: **produtos** (nome ou SKU), **categorias** e **fornecedores** — só conteúdo ativo. Cada grupo limitado (6 produtos / 4 categorias / 4 fornecedores).
- Navegação (sempre para o catálogo filtrado): produto → `?q=<nome>`; categoria → `?categoria=<slug>`; fornecedor → `?fornecedor=<slug>`; Enter sem seleção / "Ver todos os resultados" → `?q=<termo>`.
- Teclado: ↑/↓ percorre as sugestões, Enter navega a ativa (ou o termo), Esc fecha. Mouse: hover destaca, clique navega.

### Arquitetura

- **`features/catalog/search.ts`** (novo) — tipos + `SEARCH_MIN_LENGTH` (2), **livre de Prisma**. Existe para não arrastar o Prisma (`pg`→`fs`) para o bundle do cliente: o `catalog-service` (servidor) e os componentes de busca (cliente) importam daqui. **Gotcha registrado:** importar um _valor_ (não só `type`) de um módulo que puxa `lib/prisma` para dentro de um `"use client"` quebra o build com `Module not found: Can't resolve 'fs'` — mantenha constantes/consts compartilhadas com o cliente fora dos módulos de service.
- **`catalog-service.searchCatalog(term)`** — `Promise.all` de 3 consultas (produto `OR` nome/sku `insensitive`; categoria/fornecedor por nome). Retorna `< SEARCH_MIN_LENGTH` como vazio.
- **`app/api/search/route.ts`** (novo) — GET público, `?q=`, `Cache-Control: no-store`. Autocomplete usa GET/fetch (não Server Action, que é POST) — consistente com o catálogo ser read-only.
- **`hooks/use-catalog-search.ts`** (novo) — debounce 250ms + `AbortController` (cancela requisições em voo, evita resposta fora de ordem); abaixo do mínimo não consulta.
- **`components/layout/global-search.tsx`** (novo) — componente compartilhado (campo + painel de sugestões + teclado + roteamento). `onMouseDown preventDefault` nas linhas para o clique registrar antes do blur; fecha por blur fora do container / Esc / clique fora.
- **`header-search.tsx`** — reescrito: a lupa abre um **popover** com `<GlobalSearch autoFocus />` (antes era um input simples que só submetia no Enter, sem sugestões). Fecha por clique-fora/Esc.
- **`mobile-nav.tsx`** — o form de busca simples do menu lateral virou `<GlobalSearch inline />` (mesmas sugestões no mobile).

### Catálogo (limpeza)

- A **barra de busca do catálogo já não existia** (migrada ao cabeçalho em sessões anteriores); `ProductFilters` segue só com "Limpar filtros" (zera q/categoria/fornecedor). O param `?q=` continua lido no servidor por `produtos/page.tsx` → nada a mudar lá. Objetivo atendido: sem duplicidade, busca única na navbar.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **API `/api/search` validada por `curl`** (dev server próprio): `far` → produto "Farinha de Trigo Tipo 1 Premium" (SKU FAR-001) + categoria "Farinhas"; `forno` → fornecedor "Fornobom"; `FAR-0` → produto (busca por código OK); `f` (1 char) → vazio (guard de tamanho mínimo). Grupos vazios corretos.
- **DOM do cabeçalho** confirmado no navegador (lupa "Buscar no site" ao lado de "Minha cotação"). **Interatividade do cliente não exercitável no preview** desta sessão — a hidratação não executou no tab (glitch de composição já registrado: `read_page` vazio, screenshot em timeout, `aria-expanded` não alterna ao `.click()`, sem logs no console apesar dos chunks JS 200). Lógica do cliente coberta por type-check + lint + revisão; API e render por curl/DOM.

Pendências: as anteriores seguem (de-para segmento→categoria, assets de imagem, números de marketing, modo escuro, `/contato` 404). Opcional futuro: destacar (`<mark>`) o trecho que casou nas sugestões; cachear respostas de busca populares.

---

## 2026-07-17 — Seção "Fornecedores parceiros" na home (carrossel reintroduzido)

A cliente pediu de volta a vitrine de fornecedores na home (supersede a remoção de 2026-07-16). Reintroduzida **logo abaixo do hero e antes de "Compre por segmento"** — o visitante entende a proposta e então vê as marcas (credibilidade), sem competir com o banner. Rótulo **"Fornecedores parceiros"** (não "Grandes marcas parceiras"), como anotado na pendência da Sessão 16.

### O que foi feito

- **`components/home/home-suppliers.tsx`** (novo) — Server Component: busca `listActiveSuppliers()`, filtra os que têm **produtos ativos** (`_count.products > 0`, para o clique nunca cair em listagem vazia), e renderiza a seção com o `<SupplierCarousel>`. Título: `h2` **"Fornecedores parceiros"** (a pedido da cliente, 2026-07-17 — antes eram kicker + `h2` "As marcas que a Mira distribui" + subtítulo; ficou só o título). Sem fornecedor elegível, **não renderiza** (nada de faixa vazia). Faixa `bg-muted/30 border-y` (strip discreto), `py-14 lg:py-16` (menor que as demais seções, para não pesar).
- **`app/(public)/page.tsx`** — insere `<HomeSuppliers />` entre o hero e `<HomeSegments />`. É Server Component síncrono renderizando um filho async (RSC permite) — nada de tornar a página `async`.
- **`SupplierCarousel` aprimorado** (o componente já existia, marquee CSS infinito, pausa no hover, `prefers-reduced-motion`, fade nas bordas, clique → `/produtos?fornecedor=slug`): adicionado **scale sutil no hover** (`hover:scale-110`) + `duration-300 ease-out`, e **paridade no foco por teclado** (`focus-visible:scale-110` + `focus-visible:grayscale-0`, que faltava). Estado padrão continua `grayscale opacity-70`; no hover volta a cor + opacidade 100% + cresce.

### Verificação (navegador — carrossel é CSS puro, observável no preview mesmo com o glitch de hidratação já registrado)

- **Ordem confirmada** (DOM + screenshot): hero → "As marcas que a Mira distribui" → "Compre por segmento" → "Como funciona" → números.
- **Marquee:** `animation: marquee 40s linear infinite`, 12 itens (6 fornecedores × 2, loop contínuo `-50%`), wrapper `overflow: hidden`, mask fade nas bordas, pausa no hover.
- **Aparência:** estado padrão `filter: grayscale(1)` + `opacity: 0.7` (computado + visível no screenshot). **Regras `:hover` lidas direto do stylesheet** (prova determinística, Tailwind v4 nesting): `hover:grayscale-0`→`grayscale(0%)`, `hover:opacity-100`→`opacity:1`, `hover:scale-110`→`scale:110%` — todas sob `@media (hover:hover)` (sem hover grudento no touch). `transition` cobre `filter/transform/scale/opacity` (transição suave).
- **Clique:** `<Link>` real (`<a href>`) → `/produtos?fornecedor=<slug>` (ex.: `ruby-snacks`, `fornobom`) — navega mesmo sem hidratação.
- **Responsivo:** desktop 1311px e mobile 375px **sem overflow horizontal** (`scrollWidth == clientWidth`); no mobile ~3 logos visíveis por vez, marquee seguindo (ajuste automático à largura).
- `type-check` + `lint` + Prettier limpos.
- **Dados de dev:** só existiam 2 fornecedores com produtos ativos (Fornobom sem logo → fallback texto; RUBY SNACKS com `.webp`). Para provar "várias logos na linha" + loop, semeei **4 fornecedores + 4 produtos ativos temporários** (`zztmp-*`, reusando o logo do RUBY), verifiquei e **removi tudo depois** (banco restaurado a Fornobom + RUBY; arquivo de logo compartilhado intacto).

Observação: com poucos fornecedores reais cadastrados, a faixa fica curta — ao cadastrar mais marcas (com logo), o carrossel enche naturalmente. Fornecedores sem logo caem no fallback com o nome.

---

## 2026-07-17 — Refinamento visual da página "Sobre" (hierarquia, tipografia e espaçamento)

Ajustes de acabamento a pedido da cliente para aproximar `/sobre` do layout de referência, **sem mudar estrutura, identidade nem adicionar seções** (a página segue 100% institucional; o carrossel de fornecedores é só da home). Só `app/(public)/sobre/page.tsx`.

- **Container unificado:** todas as seções passaram de `max-w-6xl` → **`max-w-7xl` (1280px)** — o hero já era 7xl; era a origem da sensação de "conteúdo estreito". Verificado: as 5 seções agora medem 1280px.
- **Hero:** bloco de texto `max-w-xl`→`max-w-2xl`; título `text-4xl/5xl`→**`text-5xl/6xl`**; descrição `text-lg`→`text-lg sm:text-xl` com `leading-9`; padding `py-16/20`→`py-20/28`. Kicker "QUEM SOMOS · DESDE 1982": `text-xs`→`text-sm`, `font-semibold`, `tracking-[0.2em]`→`[0.3em]`, e **ganhou uma linha vermelha** (`bg-brand h-1 w-20 rounded-full`) abaixo — o pedido falava em "deixar a linha vermelha mais comprida" no kicker, mas não existia linha ali; adicionei (não é seção nova, é acento visual).
- **Cards de números:** container 7xl; `gap-4`→`gap-5 lg:gap-6` (mais espaço entre linhas); padding `p-6`→`p-7 lg:p-8` (cards mais altos); ícone `size-6`→**`size-8`**; número `text-2xl/[28px]`→**`text-3xl/4xl`**; label `text-sm`→`text-sm sm:text-base` com `leading-relaxed`.
- **Nossa história:** medida de leitura confortável (texto em `max-w-2xl` = 672px), parágrafos `text-base`→**`text-lg`**, `leading-relaxed`→**`leading-8` (32px)**, `space-y-4`→`space-y-5`; grid `[1fr_300px]`→`[minmax(0,1fr)_360px]` com `lg:gap-16`; imagem placeholder `min-h-75`→`min-h-80`. **Linha vermelha** do título: `h-1 w-11 rounded`→**`h-1.5 w-16 rounded-full`** (6px×64px) com `mb-6` (mais respiro até o título).
- **Frase destacada (blockquote):** padding `p-8/9`→**`p-10 pl-12 / sm:p-12 sm:pl-16`**; fonte `text-xl/2xl`→**`text-2xl/3xl`** (30px no sm). A **barra vermelha lateral** deixou de ser `border-l-4` (4px) e virou um **elemento de identidade**: `<span>` absoluto `bg-brand w-2 rounded-full inset-y-4 left-4` — **8px, cantos arredondados, ~87% da altura** (229px de 263px). Blockquote agora `relative overflow-hidden` com `pl` para abrir espaço à barra.
- **CTA "Vamos crescer juntos?":** faixa `rounded-[20px]`→`[24px]`, padding `p-8/10`→**`p-10 / sm:p-14`** (mais alta); título `text-xl/2xl`→`text-2xl/3xl`; subtítulo `mt-1`→`mt-3 text-lg`; espaço texto↔botões `gap-5`→`gap-8`; botões (já `size lg`) ganharam **`h-14 px-8 text-base font-semibold`** (56px, mais encorpados); grupo de botões `gap-3`→`gap-4`.
- **Respiro entre seções:** vem do padding interno (não de margens). Desktop (lg): hero(py-28)→cards(py-20) ≈192px; cards→história(py-16) ≈144px; história→frase(py-16) ≈128px; frase→CTA — o CTA não tinha `pt`, então adicionei **`pt-4 lg:pt-8`** para o gap subir de ~64px para ~96px (o par que a cliente apontou como apertado).

Verificação: `type-check` + `lint` + Prettier limpos. **Navegador** (público renderiza no preview): hero e cards conferidos por screenshot (desktop e mobile); as seções abaixo da dobra (scroll do preview travado — glitch já registrado) foram medidas por `getComputedStyle`/`getBoundingClientRect`, confirmando todos os valores acima. **Sem overflow horizontal** em desktop (1326px) e mobile (375px, cards em 2 colunas, h1 48px). Nenhuma seção adicionada; conteúdo e identidade inalterados.

---

## 2026-07-18 — Novo Hero da home: slider full-screen premium + navbar transparente

Reformulação completa da seção Hero (supersede o hero de 2 colunas com "Imagem em breve" da direção "Moderno"). Sem mudança de schema/DB. Estética premium/institucional com identidade própria da Mira (referência só como inspiração conceitual).

### Slider full-screen (`components/home/home-hero.tsx` — client)

- **Altura ≈100svh** (`h-[100svh] min-h-[600px]`), fundo em tela cheia, conteúdo sobreposto. Verificado: 720px em desktop 1280×720, 812px em mobile 375×812.
- **6 slides** contando uma história da Mira: Food Service (flagship), Panificação, Confeitaria, Sorveterias, Centro de Distribuição, Equipe Comercial.
- **Conteúdo/edição isolados** em `components/home/hero-slides.ts` (única fonte a editar): por slide `{ eyebrow, title, description, image?, gradient, primaryCta?, secondaryCta? }`; CTAs padrão compartilhados (`DEFAULT_HERO_CTAS`: "Ver catálogo" → produtos, "Solicitar cotação" → cotação); selos de confiança fixos (`HERO_TRUST_BADGES`).
- **Imagens ainda não existem:** enquanto `slide.image` estiver ausente, cada slide usa um **degradê institucional azul** como fundo (variações sutis por slide) — nada quebra, nenhum 404. Quando as fotos forem produzidas, colocar em `public/images/hero/<arquivo>.jpg` e preencher `image` (renderiza via `next/image` `fill`, `priority` só no 1º = pré-carrega só o primeiro banner; demais lazy). O overlay funciona sobre foto OU degradê.
- **Comportamento:** autoplay 6,5s (setTimeout reagendado por slide), pausa no hover/foco (`onMouseEnter`/`onFocusCapture`) e quando a aba fica oculta (`visibilitychange`); setas discretas (só `sm+`); indicadores (bolinhas, o ativo vira uma pílula vermelha); teclado ←/→. Totalmente responsivo.
- **Animações (só `transform`/`opacity`, GPU):** fade entre slides (crossfade das camadas de fundo, `opacity` + `transition duration-1000`); **Ken Burns** (`.hero-ken-burns`, zoom 1.04→1.16 em 9s no slide ativo); entrada de conteúdo escalonada via `key={current}` + `animation-delay` — eyebrow/título da esquerda (`.hero-in-left`), descrição/botões/selos de baixo (`.hero-in-up`). Keyframes em `globals.css`; sob `prefers-reduced-motion` tudo desliga e o conteúdo aparece imediato (`both` + regra global).
- **Overlay institucional:** degradê azul-escuro (topo→base p/ leitura + esquerda p/ o texto) com **acento vermelho** sutil (radial no canto superior-direito e inferior-esquerdo). Fotografia/degradê permanecem visíveis.
- **Parallax sutil na rolagem:** camada de fundo desloca a `scrollY * 0.3` (teto 15% da viewport), via listener `scroll` passivo + `requestAnimationFrame`, só enquanto o hero está visível; wrapper com overscan (`-top-[16%] h-[132%]`) para não abrir vão. Desligado em `prefers-reduced-motion`.
- **Transição em onda (não reta):** SVG no rodapé do hero preenchido com `var(--background)` faz a curva suave para a próxima seção.
- **Botões:** primário vermelho (`bg-brand`, sombra, `hover:-translate-y-0.5`); secundário contorno claro (`border-white/50 bg-white/5 text-white backdrop-blur`, hover mais forte). Selos de confiança abaixo com ícones lucide discretos (`History/Package/Headset/Truck`, em vermelho): +40 anos · +2.500 produtos · Atendimento especializado · Distribuição para toda a região.

### Navbar transparente sobre o hero (`site-header.tsx` virou client)

- Sobre o hero (só na home, `pathname === "/"`, no topo): cabeçalho **`fixed` e transparente** — logo branco (`public/logo-mira-white.png`, copiado de "Mira - Logo - Branca.png"), links/ícones brancos, barra utilitária transparente, sem borda/sombra. Ao rolar (`scrollY > 24`) **ou em qualquer página sem hero**: vira **sólido** — `bg-background/70` + `backdrop-blur` + sombra + borda, barra utilitária azul, logo colorido, links escuros. Transição de 300ms.
- Como o header é `fixed` (não ocupa espaço no fluxo), há um **spacer** (`h-16 md:h-[100px]`) renderizado **apenas nas páginas sem hero** para o conteúdo não ficar sob o cabeçalho; na home o hero full-screen passa por baixo de propósito.
- Prop `light` adicionada a `Logo` (usa logo branco), `MainNav` (links brancos), `HeaderSearch` (lupa branca) e `MobileNav` (hambúrguer branco). `QuoteCartButton` (vermelho) permanece — legível em ambos os estados.

### Verificação

- `type-check` + `lint` + Prettier limpos. Sem erros de console nem de servidor.
- **Navegador (DOM + estilos computados — conclusivo para estrutura/estado; screenshots do preview travaram, glitch de compositing já registrado):** home no topo → header transparente (`main bar bg rgba(0,0,0,0)`, sem sombra/blur, logo `/logo-mira-white.png`, links brancos), sem spacer; hero 720px, 6 camadas de slide, 6 bolinhas, 2 setas, onda SVG, Ken Burns + `.hero-in-left`×2/`.hero-in-up`×3 presentes. `/sobre` (sem hero) → header sólido (`bg-background/0.7`, `backdrop blur(8px)`, sombra, utilitária `#17479e`, logo colorido, links `oklch(0.556)`) + spacer 100px. Mobile 375px → hero 812px, utilitária escondida, hambúrguer branco visível, setas escondidas, logo branco, h1 36px, sem overflow horizontal (desktop e mobile: `scrollWidth == clientWidth`).
- **Não observável no preview (glitch):** o _toggle_ de scroll ao vivo na home (o preview não rola) — validado por construção: o estado sólido é idêntico ao de `/sobre`, confirmado; a lógica é `transparent = hasHero && scrollY <= 24`.

### Pendências / próximos

- **Produzir e colocar as fotos** dos 6 banners em `public/images/hero/` e preencher `image` em `hero-slides.ts` (recomendado ~2400×1400, área mais escura à esquerda para o texto). Até lá, os degradês azuis seguram o visual.
- Textos/CTAs por slide são facilmente ajustáveis em `hero-slides.ts`. `SITE_CONFIG.hero` ficou sem uso (o slider tem seus próprios textos) — pode ser removido depois.
- Seguem as pendências anteriores: números de marketing a confirmar (+2.500 produtos etc.), modo escuro, `/contato` (404), de-para segmento→categoria.

### Redesenho do Hero — "split editorial" premium (mesma data)

A pedido da cliente, o Hero foi **redesenhado** (não revertido): mantém os conceitos do slider full-screen (conteúdo sobre a imagem, transições, navbar transparente, altura grande), mas reorganiza o layout **inspirado na estrutura de 2 colunas do hero original**, agora muito mais refinado. Só `home-hero.tsx` (render) + um keyframe novo em `globals.css`; motor do slider, `hero-slides.ts` e a navbar transparente **inalterados**.

- **Altura:** `min-h-[92svh]` (grande, porém mais "aerado" que 100svh — mostra um fio da próxima seção, convidando a rolar).
- **Duas colunas** (`lg:grid-cols-[1.15fr_0.85fr]`, verificado):
  - **Esquerda (a mensagem):** kicker com traço vermelho + tema, **título display grande** (`xl:text-[4.25rem]` = 68px), subtítulo — os três **trocam a cada slide** (`key={current}` reanima). Botões e selos de confiança são **fixos** (montam uma vez, não piscam a cada rotação — hierarquia mais estável). Botão primário vermelho evoluído (sombra `shadow-brand/25`, `hover:-translate-y-0.5`); secundário glass. Selos em grade 2×2 com ícones em "pílulas", separados por borda superior.
  - **Direita (painel de vidro sobre a imagem):** navegador de **"capítulos"** — `bg-white/[0.07] + backdrop-blur-md + border-white/15 + shadow-2xl`, com "Destaques", **contador `01 / 06`** e a lista dos 6 temas. O ativo fica branco/vermelho com uma **barra de progresso do autoplay** (`.hero-progress`, keyframe `scaleX` 0→1, `animation-duration = AUTOPLAY_MS`, `animation-play-state: paused` no hover — pausa junto com a troca). Cada capítulo é clicável (`goTo`). É a evolução do "bloco de imagem à direita" do hero antigo, agora funcional. Escondido no mobile.
- **Mobile:** empilha (coluna única); o painel de capítulos some e voltam as **bolinhas** (`lg:hidden`); setas `sm+`. Sem overflow (verificado 438px e proporção mobile).
- **Mantidos:** fundo rotativo full-bleed (foto/degradê) + Ken Burns + fade + parallax; overlay azul (leitura, reforçado à esquerda) + acento vermelho; onda SVG no rodapé; navbar branca transparente→sólida.

Verificação (DOM/estilos computados — screenshots do preview seguem travando pelo glitch de compositing já registrado): desktop 1280 → grid `1.15fr 0.85fr`, painel de vidro `display:block` (blur 12px, bg branco/0.07, borda branco/0.15), capítulo ativo com vermelho, contador `01 / 06`, barra `hero-progress 6.5s`, título 68px, setas visíveis, bolinhas mobile ocultas, header transparente (`main bar rgba(0,0,0,0)`, logo branco), sem overflow horizontal. Mobile → coluna única, bolinhas visíveis, sem overflow. `type-check` + `lint` + Prettier limpos; sem erros de console/servidor.

**Ajuste de altura (mesma data):** hero reduzido de `min-h-[92svh]` → **`min-h-[78svh]`** (dentro dos 75–80vh pedidos, deixa o topo da próxima seção aparecer sem rolar muito). Reequilíbrio proporcional (não só encolher): título `xl:text-[4.25rem]`→`xl:text-6xl` (68→60px desktop; lg 52px), subtítulo `text-lg/xl`→`text-base/lg` (18px), paddings do grid `pt-28 pb-28`→`pt-28 pb-20`, gaps `gap-10/lg:gap-16`→`gap-8/lg:gap-12`, ritmo vertical apertado (`mt-6/9/10`→`mt-5/7/8`, `pt-7`→`pt-6`), painel de vidro `p-6`→`p-5` e linhas `py-2`→`py-1.5`. Verificado: 78vh em desktop (624px de 800) e mobile (633px de 812), duas colunas `1.15fr 0.85fr` preservadas, painel visível no desktop / bolinhas no mobile, sem overflow horizontal; `type-check`+`lint`+Prettier limpos, console limpo.

### Hero limpo (sem card) + padronização de cores da marca (mesma data)

**Hero — remoção do painel "Destaques":** a pedido da cliente, o card lateral (navegador de capítulos) foi **removido** — o Hero voltou a ser **coluna única** (`max-w-2xl`, conteúdo sobreposto ao banner), com foco no banner. Removidos o helper `pad`, o bloco do card e o keyframe/classe `.hero-progress` do `globals.css` (dead code). Navegação manual agora é por **setas** (`sm+`) + **bolinhas** centralizadas (visíveis em todos os tamanhos). Autoplay 6,5s, Ken Burns, fade, parallax e navbar transparente **mantidos**. Verificado (DOM): card ausente, `.hero-progress` ausente, coluna 672px, 6 bolinhas `flex`, 2 setas, 78vh mantido, sem overflow.

**Preparo para fotos por slide (mantido):** cada slide aceita `image` (full-bleed via `next/image`); sem foto, usa o degradê da marca (ver abaixo). Overlay tornado mais **discreto** (azul da marca ~0,74 na base → 0,18 no topo; leve acento vermelho 0,10–0,18) para valorizar a fotografia sem perder leitura.

**Padronização de cores (só `#17479e` azul + `#ed1c24` vermelho, com shades):**

- **Hero:** base e overlay passaram de azuis-navy fora da marca (`#0a1f4d`/`#06122e`) para tons de `#17479e` (`bg-[#0e2c62]` = azul da marca escurecido; overlay em rgba de `#0e2c62`/`#091a3e`). Os **6 gradientes variados por slide** (‌#12356f, #1c4fa8, #2a5bb5, …) foram **removidos** — agora há um único `BRAND_HERO_GRADIENT` (`#0e2c62 → #17479e → #2159bd`, só tons do azul da marca) usado por todos (campo `gradient` virou opcional, com fallback). Verificado: fundo `rgb(14,44,98)`, gradiente com o meio em `rgb(23,71,158)` = **#17479e** exato.
- **Rodapé (principal ofensor):** todo o `slate-900/800/700/500/400/300` trocado por **`#0e2c62`** (mesmo azul escuro do hero — dá consistência de ponta a ponta) + brancos com opacidade (`text-white/70|65|45`, `border-white/25|15`). Faixa vermelha `--brand` mantida; hover das redes agora vai a `text-primary` (#17479e). Verificado: `footerBg rgb(14,44,98)`, faixa `rgb(237,28,36)`, **zero `slate`** no DOM.
- **Badge de status (painel):** `IN_PROGRESS` deixou de usar o azul do Tailwind (`bg-blue-100/text-blue-800`, `bg-blue-500`) e passou a usar o azul da marca (`bg-primary/10 text-primary`, barra `bg-primary`). Âmbar (pendente) e verde (concluída) foram **mantidos** de propósito — cores semânticas de status (semáforo), não "tons de azul". Se a cliente quiser, dá para levá-los ao azul/vermelho também.
- **Tokens já eram da marca** (`--primary #17479e`, `--brand #ed1c24`, `--ring`, `--accent #eaf0fb` como tint claro): inalterados. Cinzas neutros (background/muted/border via `oklch` chroma 0) mantidos — são neutros, não "azuis diferentes".

Varredura final: nenhum `bg-/text-/border-slate|blue-N|sky|indigo` fora da marca nos fontes; `type-check` + `lint` + Prettier limpos; console/servidor sem erros.

### Transição Hero → Fornecedores: card flutuante (mesma data)

A cliente apontou um vão grande entre o hero e "Fornecedores parceiros" (navegação parecia interrompida). Causa: hero com conteúdo centralizado (sobra escura embaixo) + onda branca + a seção de fornecedores como faixa `bg-muted/30` com `py-14/16` e `mb-10` — muito espaço morto e troca de cor seca.

Solução (continuidade visual, não só reduzir espaço): **`HomeSuppliers` virou um card flutuante que sobe e sobrepõe a base do hero.**

- `components/home/home-suppliers.tsx`: a faixa cinza `border-y bg-muted/30` deu lugar a um **card** (`rounded-3xl border bg-background shadow-xl shadow-[#0e2c62]/10`) dentro de uma `<section relative z-20 -mt-12 sm:-mt-16>` — a margem negativa faz o card **invadir o hero** (48px no mobile, 64px no desktop) com sombra, criando profundidade e ponte visual. Título reduzido (`text-2xl sm:text-3xl`) e `mb-8`.
- `components/home/home-hero.tsx`: **removida a onda SVG** do rodapé (o card faz a transição agora) e as **bolinhas subiram** para `bottom-20 sm:bottom-24` (80/96px) para ficarem logo acima da borda do card, sem colisão (folga de 32px em ambos os breakpoints). Docstring atualizado (não menciona mais duas colunas/painel de vidro/onda — resíduos de versões anteriores).

Verificado (DOM/estilos, screenshots seguem travando pelo glitch): desktop 1280 → `HomeSuppliers` `margin-top -64px`, `z-20`, card branco `rounded 24px` com sombra, bolinhas `bottom 96px`; onda ausente (só ícones lucide 24×24 no hero); sem faixa cinza; sem overflow. Mobile 375 → `margin-top -48px`, bolinhas `bottom 80px`, card presente, sem overflow. `type-check` + `lint` + Prettier limpos; console/servidor sem erros.

### Refino do card de Fornecedores (mesma data)

Ajustes finos no card flutuante (sem reformular): mais presença, mais elegante e mais integrado ao hero.

- **`components/home/home-suppliers.tsx`:** card **mais largo** (`max-w-7xl` → `max-w-[85rem]`/1360px, com `px-4 sm:px-6`), **mais baixo** (`py-9 lg:py-11` → `py-7 lg:py-8`; `mb-8` → `mb-6`), **sobe mais** (`-mt-12 sm:-mt-16` → `-mt-16 sm:-mt-20` = 64/80px de sobreposição). **Sombra mais discreta/moderna** (`shadow-xl shadow-[#0e2c62]/10` → `shadow-[0_18px_50px_-28px_rgba(14,44,98,0.3)]`). **Fundo levemente acinzentado** `bg-[#fcfcfc]` (era `bg-background`). Novo **subtítulo institucional** discreto abaixo do título ("Trabalhamos com as principais marcas…", `text-muted-foreground`).
- **`features/catalog/components/supplier-carousel.tsx`:** **logos maiores** — tile `h-16 w-32` → `h-20 w-44`, imagem interna `h-12` → `h-16` (48px → 64px de altura), `sizes` 128→176px; **gap uniforme maior** `gap-12` → `gap-16 lg:gap-20` (64/80px). Animação segue `marquee 40s linear infinite` (contínua/suave, pausa no hover) — só cresceu o espaçamento.
- **`components/home/home-hero.tsx`:** bolinhas subiram (`bottom-20 sm:bottom-24` → `bottom-24 sm:bottom-28` = 96/112px) para acompanhar o card mais alto, mantendo **32px de folga** da borda do card em ambos os breakpoints.
- **`components/home/home-segments.tsx`:** padding superior reduzido (`py-20 lg:py-24` → `pt-12 pb-20 lg:pt-16 lg:pb-24`) — distância do card até "Compre por segmento" caiu de ~96px para **64px**, navegação mais fluida.

Verificado (DOM/estilos): desktop 1280 → overlap −80px, card `py 32px`, `bg rgb(252,252,252)`, sombra `0 18px 50px -28px rgba(14,44,98,.3)`, card `max-w 1360`, logos tile 176px / caixa 64px, gap marquee 80px, `40s linear infinite`, bolinhas `bottom 112px` (folga 32), segments `pt 64px`, subtítulo presente (muted). Mobile 438/375 → overlap −64px, gap 64px, bolinhas 96px (folga 32), sem overflow. `type-check` + `lint` + Prettier limpos; console/servidor sem erros.

---

## 2026-07-18 — Refinamentos de navegação no cabeçalho (sem reformular)

Ajustes pontuais pedidos pela cliente para deixar a navbar mais equilibrada/elegante, **mantendo** o layout e a transição atuais. Sem mudança de schema/DB.

### Logo — branca sobre o hero, colorida no estado sólido

Nota: numa primeira iteração desta sessão a cliente pediu uma logo única em todos os estados (com halo), mas em seguida **preferiu manter a troca por contraste** — branca sobre o hero, colorida ao rolar. Registro só a decisão final.

- `components/layout/logo.tsx`: a prop `light` foi **renomeada para `overHero`** (mesma semântica de antes). Quando `true` (cabeçalho transparente sobre o hero azul), usa `/logo-mira-white.png`; quando `false` (cabeçalho sólido/fundo branco, e páginas sem hero), usa a versão **colorida** oficial (`logo-mira.png`, com as variantes de tema `dark:` intactas). É o comportamento original de troca por rolagem, agora sob o nome `overHero`. Sem halo/efeito.
- A prop `light` das demais peças (`MainNav`, `HeaderSearch`, `MobileNav`) **permanece** — links/ícones brancos sobre o hero seguem necessários e corretos.

### Menu — itens maiores e mais arejados (iterado 2×)

- `components/layout/main-nav.tsx` (valores finais): links `text-sm px-3 py-2` → **`text-[17px] px-5 py-3`** (fonte 14→17px; padding horizontal 12→20px, vertical 8→12px) e gap entre itens `gap-1` → **`gap-3`** (4→12px). Resultado: espaço texto-a-texto entre itens ≈ **52px** (gap 12 + 2×20 de padding) — arejado e premium, sem exagero. O menu mobile **não** é afetado pelo gap (sobrescreve para `gap-1` em `mobile-nav.tsx`); a fonte/padding maiores valem lá também (bons alvos de toque).
- Equilíbrio geral da navbar (confirmado por `getComputedStyle`): logo↔menu `gap-10` (40px), itens `gap-3` (12px, cluster coeso separado da logo), grupo direito lupa↔botão `gap-3 sm:gap-4` (16px no desktop, cluster de controles), botão "Minha cotação" h-40/px-20/peso-600. Distribuição: logo à esquerda · menu agrupado · controles à direita (via `justify-between`).

### Botão "Minha cotação" (CTA principal) — mais destaque

- `features/quote/components/quote-cart-button.tsx`: `size="sm"` (h-9/36px, px-3, text-xs) → **`size="default"`** (h-10/40px, px-5/20px, text-sm) ≈ +11% de altura + padding mais confortável; adicionados `font-semibold` e `shadow-sm`. Mantidos vermelho da marca (`bg-brand #ed1c24`), pílula (`rounded-full`) e o badge de contador. Também reflete no menu mobile (usa o mesmo componente).

### Espaçamento

- `components/layout/site-header.tsx`: gap do grupo direito (lupa ↔ botão) `gap-2` → **`gap-3 sm:gap-4`** (8→16px no desktop); gap logo ↔ menu `gap-8` → **`gap-10`**.
- `components/layout/main-nav.tsx`: gap entre itens do menu `gap-1` → **`gap-2`** (4→8px) — navegação mais leve.

### Barra superior — REMOVIDA (cabeçalho de barra única)

Nota: nesta sessão a barra utilitária (azul) chegou a ganhar um rotador de mensagens institucionais (`top-bar-rotator.tsx`), mas em seguida a cliente pediu para **remover toda a faixa azul** e ter só uma barra de navegação. Registro só o estado final.

- **Faixa utilitária removida por completo** de `components/layout/site-header.tsx` (o `<div>` da barra azul com o rotador + engrenagem). O `header` agora tem **um único filho** (a navbar `.mx-auto`, `h-16`/64px). O componente `top-bar-rotator.tsx` foi **deletado** (sem uso). As informações da faixa (unidades etc.) **não** foram movidas para a navbar — foram descartadas, a pedido da cliente.
- **Exceção — engrenagem do painel admin:** movida da faixa para a navbar como **atalho administrativo reservado**, **isolado no extremo canto direito** (é o **último** filho do grupo direito, flush à borda), separado do cluster de cliente por `ml-6` (24px). Minimalista e **visível porém subordinado** (não disputa atenção com menu/CTA): `size-8` de área, ícone `size-4` (16px), cor `text-muted-foreground/70` (sólido) / `text-white/70` (sobre o hero), subindo a contraste no hover/foco (`focus-visible:ring`). (Chegou a ficar a `/40`, mas ficou discreto demais — a cliente não achava; subido para `/70`.) `title` + `aria-label` "Painel administrativo", `→ ROUTES.admin.login` (`/login`). **Presente na navbar em todos os tamanhos** (`inline-flex`, `ml-4 sm:ml-6`) — inclusive mobile, ao lado do hambúrguer. **No canto extremo do viewport em telas largas:** `2xl:absolute 2xl:right-8 2xl:top-1/2 2xl:-translate-y-1/2 2xl:ml-0` — a partir de 1536px (onde o bloco central `max-w-7xl` deixa margem sobrando) a engrenagem **sai do fluxo e cola na borda direita da janela** (32px), separada do bloco de conteúdo (pedido da cliente, que usa tela larga). Abaixo de `2xl` volta ao fluxo ao lado do CTA (sem margem para colar na borda sem sobrepor). Verificado: 1920px → `position:absolute`, `right:32px`, `ml:0`; 1280px → `position:static`, `ml:24px`, último do grupo.
- **Altura reduzida:** o header caiu de ~100px (36 da faixa + 64) para **64px** em todos os breakpoints. O espaçador das páginas sem hero passou de `h-16 md:h-[100px]` para **`h-16`**. A transição transparente↔sólido e a troca de logo (branca↔colorida) seguem intactas, agora só na barra única.

### Verificação

- `type-check` + `lint` limpos.
- **Estilos computados** (preview próprio; screenshots/hidratação bloqueados pelo glitch de compositing já registrado): `header` com **1 filho** (barra única `h-16`), faixa azul e rotador ausentes; estado transparente (home, topo) → header `bg rgba(0,0,0,0)`, logo **branca** (`logo-mira-white.png`), lupa branca, engrenagem `white/70`, última do grupo (`ml 24px`, box 32/ícone 16); estado sólido (`/sobre`) → logo **colorida** (`logo-mira.png`; branca ausente), header `oklab(1 0 0 / .7)`, engrenagem `muted/70` (oklab .556 / .7), última do grupo, `href=/login`; comum → botão 40px/px-20/peso 600/`#ed1c24`, itens do menu 17px/px-5/py-3, gap menu 12px, gap lupa↔botão 12/16px.

Pendências anteriores seguem abertas (fotos do hero, números de marketing a confirmar, modo escuro, `/contato` 404, de-para segmento→categoria).

---

## 2026-07-20 — Subcategorias (2 níveis) + "Compre por segmento" dinâmico (supersede de-para segmento→categoria)

Suporte real a **categoria → subcategoria** (hierarquia de dois níveis) na estrutura e na interface, e a home "Compre por segmento" passou a ser **dinâmica** a partir das categorias raiz. **Sem migration** — a auto-relação `parent`/`children` já existia no schema desde o início; só faltava aproveitá-la. **Nenhum dado foi tocado** (decisão da cliente: "só implementar o suporte"; as 5 categorias principais — Panificação e Confeitaria, Lácteos, Gorduras e Ingredientes, Padaria/Salgados/Food Service, Embalagens e Equipamentos — e as subcategorias serão cadastradas por ela pelo painel).

### Invariante de dois níveis (aplicado no service, não no banco)

`features/category/services/category-service.ts`:
- `listCategories()` agora devolve a **árvore** (raízes com `children`), para a listagem do painel montar a hierarquia sem lógica no componente.
- `listCategoryOptions(excludeId?)` (select "Categoria pai") passou a retornar **só categorias raiz** (`parentId: null`) — impede escolher uma subcategoria como pai (o que geraria 3+ níveis).
- Novo `listCategoryTreeOptions()` — lista **plana com `depth`** (0 = raiz, 1 = sub), para o select de categoria do **produto** (produto pode ficar na raiz ou na subcategoria; sub aparece indentada com "↳").
- Novo guard `assertValidParent(parentId, categoryId?)` chamado em `create`/`update`: pai precisa ser raiz; categoria não pode ser pai de si mesma; **categoria que já tem subcategorias não pode virar subcategoria**.
- `deleteCategory` agora **também bloqueia** se houver subcategorias dentro (além do bloqueio por produtos vinculados que já existia). Obs.: a auto-relação é `onDelete: SetNull`, então o bloqueio explícito é o que evita "órfãs viram raiz" silenciosamente.

### Catálogo público — ciente de subcategorias

`features/catalog/services/catalog-service.ts`:
- `listActiveCategories()` (plana) **substituída** por `listActiveCategoryTree()` — raízes ativas com `children` ativas + `totalActiveProducts` (produtos ativos da raiz **somados aos das subcategorias**).
- `listPublicProducts` — filtrar por uma **raiz** agora inclui os produtos das **subcategorias** dela: `category: { OR: [{ slug }, { parent: { slug } }] }`. Filtrar por uma subcategoria isola só ela.
- `CategoryFilter` (`features/catalog/components/category-filter.tsx`) reescrito para **dois níveis**: 1ª linha = chips das raízes; ao ativar uma raiz (ou uma sub dela), aparece a 2ª linha com "Tudo em {raiz}" + chips das subcategorias. Param segue `?categoria=<slug>` (raiz ou sub).
- `produtos/page.tsx` e `app/(public)/categorias/page.tsx` migrados para a árvore (a página `/categorias` mostra a linha de subcategorias sob cada card).

### Home "Compre por segmento" — dinâmica (resolve o de-para)

`components/home/home-segments.tsx` deixou de ter os 4 segmentos **hardcoded** (com slugs que não batiam) e virou **Server Component async**: renderiza uma card por **categoria raiz ativa** — **todas aparecem, mesmo sem produtos ainda** (pedido da cliente; o filtro por `totalActiveProducts > 0` foi removido para não esconder categorias recém-criadas). A linha de apoio lista as subcategorias (até 4) ou cai em "Ver produtos do segmento". Imagem = `imageUrl` da categoria (upload no painel) ou placeholder. Sem raízes elegíveis, a seção some (mesmo padrão de `HomeSuppliers`). Grid `sm:grid-cols-2 lg:grid-cols-3` (acomoda 4–6 cards; as 5 principais caberão bem). **Isso encerra a pendência "de-para segmento→categoria"**: os 5 segmentos = as 5 categorias raiz reais; ao cadastrá-las no painel, a home reflete sozinha.

### Painel — "fácil de gerenciar"

- Listagem de categorias (`app/(admin)/admin/categorias/page.tsx`): tabela **hierárquica** (raiz + subcategorias indentadas com ícone `CornerDownRight` e leve `bg-muted/30`). Cada raiz tem um atalho **"＋ Nova subcategoria"** → `/admin/categorias/nova?parent=<id>`.
- `CategoryForm` ganhou `defaultParentId` (pré-seleciona o pai vindo de `?parent=`) e uma nota explicando o modelo de dois níveis. A página `nova` lê `?parent`, valida que é uma raiz existente e ajusta títulos/labels para "subcategoria".
- Selects de categoria do **produto** (novo/editar) trocaram `listCategoryOptions` → `listCategoryTreeOptions` (subcategorias indentadas).

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Navegador** (dado temporário `zztmp` semeado, verificado e **removido** — banco restaurado a 3 categorias / 2 produtos): filtro por raiz "Panificação" → **2 produtos** (o direto + o da subcategoria); filtro pela subcategoria → **1 produto**; sub-linha do filtro aparece com raiz+sub destacadas corretamente; home "Compre por segmento" mostra "Panificação" com a subcategoria na linha de apoio, exclui a raiz "Farinhas" (0 produtos) e usa o fallback na raiz sem subcategoria. (Preview com o glitch de hidratação já registrado — verificação por DOM, conclusiva para estrutura/links.)

Pendências: cadastrar as 5 categorias principais + subcategorias pelo painel (dado, não código). As anteriores seguem (fotos do hero, números de marketing, modo escuro, `/contato` 404).

---

## 2026-07-20 (tarde) — Subcategorias com campo próprio no produto + gerenciamento embutido + filtro instantâneo

Evolução da entrega da manhã (que reaproveitava a auto-relação `parent`/`children` só com `categoryId` "folha"). A cliente pediu uma UX mais integrada: **gerenciar subcategorias dentro do cadastro da categoria**, **campo de subcategoria dependente no produto**, e **filtro de subcategoria instantâneo**. Isso motivou modelar a subcategoria como **campo próprio do produto** (`subcategoryId`) — `categoryId` passa a ser SEMPRE a categoria principal.

### Banco — migração `20260720201548_add_product_subcategory` (não-destrutiva)

- `Product.subcategoryId String?` + relação nomeada `subcategory Category? @relation("ProductSubcategory", onDelete: SetNull)` + índice. A relação existente `category` virou `@relation("ProductCategory")` (nomear é exigência do Prisma quando há 2 relações entre os mesmos models; **não altera o banco**). `Category` ganhou `products @relation("ProductCategory")` e `subcategoryProducts @relation("ProductSubcategory")`.
- Gerada por `prisma migrate diff --from-config-datasource prisma.config.ts --to-schema prisma/schema.prisma --script` (Prisma 7 aposentou `--from-url`), aplicada com `migrate deploy` + `prisma generate` + **restart do dev server** (gotcha do client em memória, já registrado). Só adiciona coluna/índice/FK — dados intactos.
- **Semântica nova:** `categoryId` = categoria PRINCIPAL (sempre raiz); `subcategoryId` = subcategoria (opcional, filha de `category`). Produtos existentes: `subcategoryId` nulo, sem ajuste.

### Gerenciamento de subcategorias EMBUTIDO no cadastro da categoria (sem tela no menu)

- `category-service.ts`: novos `listSubcategories(parentId)`, `createSubcategory(parentId, name)` (valida que o pai é raiz), `updateSubcategory(id, {name, active})` (**só nome/status** — não toca descrição/imagem/pai), `deleteSubcategory(id)` (produtos são desvinculados via SetNull, permanecem na categoria principal). Novo `listCategoryTree()` (raízes + filhas `{id,name}`) para o select dependente do produto. Removidos `listCategoryOptions`/`listCategoryTreeOptions` (o select "Categoria pai" saiu).
- `category-actions.ts`: `createSubcategoryAction`/`updateSubcategoryAction`/`deleteSubcategoryAction` — **não redirecionam**, retornam `ActionResult` (o gerenciador client atualiza na hora via `router.refresh()`); guardadas por `guardAdminWrite({ scope: "category" })`.
- **`features/category/components/subcategory-manager.tsx`** (novo, client): dentro da tela de **edição** da categoria principal — lista as subcategorias com **criar** (input + "Adicionar"), **editar inline** (nome + ativa) e **excluir** (confirmação inline, avisando quantos produtos ficarão só na categoria principal). `useTransition` + `router.refresh()`.
- `CategoryForm`: **removido o select "Categoria pai"** — o formulário cria/edita só categorias principais (raiz). A página de edição (`categorias/[id]`) mostra o `<SubcategoryManager>` só para raízes. A "nova categoria" cria sempre uma raiz (nota "gerencie subcategorias após salvar"). A listagem (`categorias/page.tsx`) voltou a mostrar **só as raízes**, com contagem de subcategorias; o atalho `nova?parent=` e as linhas indentadas foram removidos (gerenciamento agora é dentro da categoria).

### Produto — campo de subcategoria dependente da categoria

- `product-schema.ts`: `subcategoryId` opcional. `product-actions.ts`: extrai `subcategoryId`. `product-service.ts`: novo `resolveSubcategoryId(categoryId, subcategoryId)` — valida que a subcategoria **pertence** à categoria (senão erro); grava em create/update.
- `product-form.tsx`: dois selects — **Categoria** (só raízes) e **Subcategoria** (dependente, client): trocar a categoria recarrega as subcategorias dela na hora e descarta a seleção anterior se não pertencer; a subcategoria fica desabilitada ("— Sem subcategorias —") quando a categoria não tem filhas e pode ficar vazia. Recebe a árvore via `listCategoryTree()`. Páginas novo/editar atualizadas (editar prefaz `subcategoryId`).

### Catálogo — filtro de subcategoria instantâneo + detalhe

- `catalog-service.listPublicProducts`: filtro reescrito com `AND` de condições (evita colisão das duas chaves `OR` — categoria e busca). `?categoria=` casa em **categoria principal OU subcategoria** (`OR: [{category:{slug}}, {subcategory:{slug}}]`); como `categoryId` é a raiz, filtrar por raiz já traz todos os produtos dela. `listActiveCategoryTree`: `totalActiveProducts` = produtos ativos da raiz (não soma mais filhas — no modelo novo já cobre tudo). `getPublicProductBySlug` inclui `subcategory`.
- `CategoryFilter` reescrito: chips viraram **botões** com navegação **client-side instantânea** (`useRouter().push(url, { scroll: false })` dentro de `useTransition`, com leve `opacity` de pending) — **sem recarregar a página**. A **barra horizontal** de subcategorias aparece ao escolher a categoria principal, com **"Todos"** como primeira opção; troca de categoria principal atualiza a barra automaticamente. A barra é **rolável** (`overflow-x-auto`) e ganhou **setas ◂ ▸** que aparecem só quando há overflow (mesmo padrão do `supplier-section`: `scrollerRef` + listeners de scroll/resize, recalculado ao trocar de categoria) — necessário porque uma categoria pode ter muitas subcategorias (ex.: Panificação já tem 12).
- Página de detalhe do produto: breadcrumb e cabeçalho mostram **Categoria › Subcategoria** quando houver.

### Verificação

- `type-check` + `lint` + Prettier limpos; migração aplicada; client regenerado; dev server reiniciado.
- **Público no navegador** (dados `zztmp` semeados, verificados e **removidos** — banco restaurado a 5 raízes / 0 subcategorias / 2 produtos): filtro por raiz "Panificação" → **2 produtos** (o sem subcategoria + o da subcategoria); pela subcategoria → **1 produto**; barra de subcategorias com "Todos" + a subcategoria, destaques corretos; detalhe do produto com breadcrumb "Produtos › Panificação › zztmp Pães Especiais › …". O **clique instantâneo** (router.push) não dispara no preview pelo glitch de hidratação já registrado — lógica coberta por type-check + revisão; o filtro por URL (server) foi verificado.
- **Admin** (não renderiza no preview — login cross-site) validado por **script `tsx`** contra o banco: `listCategoryTree`, `createSubcategory` (OK) / sob subcategoria (bloqueado), `updateSubcategory` nome+status (mantém o pai) / sobre raiz (bloqueado), `listSubcategories` com contagem de `subcategoryProducts`, produto com subcategoria de outra categoria (bloqueado) / válida (persiste cat+sub), `deleteSubcategory` sobre raiz (bloqueado) / subcategoria real (OK). Tudo passou; dados de teste removidos.

Pendências: cadastrar as subcategorias reais dentro de cada categoria principal pelo painel (dado, não código). As anteriores seguem (fotos do hero, números de marketing, modo escuro, `/contato` 404).

---

## 2026-07-20 (noite) — Resend ativado (dev) + código do produto (SKU) nos e-mails de cotação

### Resend ativado no `.env` (dev)

- Supersede a pendência "Resend configurado depois". A cliente forneceu a **API key**; preenchidos `RESEND_API_KEY` e `RESEND_FROM_EMAIL="Mira <onboarding@resend.dev>"` no `.env`. Dev server reiniciado (env só é lido no boot; `env.ts` valida o formato do FROM — "Nome <email>" passa). Envio de teste e reenvio da cotação **ORC-000001** confirmados (Resend retornou `id`, sem erro) para `quote_email_recipient` (`juliaromeralage@gmail.com`).
- **Limitação registrada:** com o remetente de teste `onboarding@resend.dev`, o Resend **só entrega para o e-mail dono da conta** Resend. Então a notificação ao comercial chega (é a conta), mas a **confirmação ao cliente** (para o e-mail que o cliente digitar) só funcionará após **verificar um domínio** (ex.: `miraff.com.br`) e trocar o `RESEND_FROM_EMAIL` para `cotacao@<domínio>`. A degradação graciosa cobre a falha do e-mail ao cliente sem afetar a cotação salva.
- Diagnóstico anterior: a cotação sempre foi **salva** (aparecia no painel); só o e-mail não saía por falta de credenciais — não era bug.

### Código do produto (SKU) nos e-mails

- `ResolvedQuoteItem` (`quote-service.ts`) ganhou `sku: string | null`; `createQuote` passou a selecionar `sku` do produto (fonte da verdade = banco) e a preenchê-lo em cada item.
- `quote-email.ts` → `renderItemsTable` agora tem **3 colunas: Código · Produto · Qtd.** (usado nos dois e-mails — comercial e confirmação ao cliente). SKU ausente aparece como "—"; código em `font-family:monospace`.
- Verificado: `type-check` + `lint` + Prettier limpos; reenvio real da ORC-000001 com a coluna Código entregue (produtos 3040 e JOO-001). Obs.: `sendQuoteEmails` não roda em script `tsx` puro (usa `unstable_cache` do Next) — o fluxo real roda dentro do Server Action; o teste de entrega usou envio direto via Resend com o mesmo layout.
- Nicety opcional (não feito): mostrar o SKU também na tela de detalhe da cotação no painel (`quote-admin`), hoje sem o código na lista de itens.

---

## 2026-07-21 — Fornecedores aparecem mesmo sem produtos (supersede "só com produtos ativos")

Decisão da cliente (mesma lógica dos segmentos): um fornecedor recém-cadastrado deve aparecer no site na hora, sem precisar ter produto vinculado. Removido o filtro `_count.products > 0` da vitrine de fornecedores em dois pontos:

- `components/home/home-suppliers.tsx` — carrossel "Fornecedores parceiros" da home: passa a exibir **todos os fornecedores ativos** (`listActiveSuppliers`), não só os com produtos. Some só se não houver nenhum fornecedor ativo.
- `app/(public)/produtos/page.tsx` — seção de fornecedores acima da listagem: idem (removido o `.filter(_count.products > 0)`).

Trade-off aceito: clicar no logo de um fornecedor sem produtos leva a `/produtos?fornecedor=<slug>` com "Nenhum produto encontrado" até cadastrar. `active: false` continua ocultando o fornecedor. O admin (`fornecedores/page.tsx`) segue mostrando a contagem de produtos por fornecedor (é coluna informativa, não filtro).

Verificado no navegador: o fornecedor novo **Adimix** (ativo, com logo, 0 produtos) agora aparece no carrossel da home e na seção da página de produtos (`/produtos?fornecedor=adimix`), ao lado de Fleischmann e RUBY SNACKS. `type-check` + `lint` + Prettier limpos.

---

## 2026-07-21 (tarde) — Ajustes de UX: carrossel de segmentos, ícone/atalhos do admin e revisão da página Sobre

Cinco ajustes de interface pedidos pela cliente. Nenhuma mudança de schema/DB.

### 1. "Compre por segmento" → carrossel horizontal (home)

Com apenas 5 segmentos a grade deixava um vão. Em vez de inventar um 6º item, a seção virou **carrossel horizontal** no mesmo padrão de navegação do Hero Banner: setas ◂ ▸ nas laterais (tablet+, aparecem só no overflow), rolagem horizontal suave (`scroll-smooth` + `scrollBy`) e responsivo (no mobile o arrastar já rola; setas ocultas).

- Novo `components/home/home-segments-carousel.tsx` (client) — recebe os segmentos como dados planos e renderiza o scroller + setas (mesma lógica `canLeft`/`canRight` do `supplier-section`: listeners de scroll/resize). Cards `w-72 sm:w-80` shrink-0 com `snap-start`; visual do card inalterado (imagem 4:3, título, subcategorias, "Explorar").
- `components/home/home-segments.tsx` continua Server Component async (busca `listActiveCategoryTree`), agora mapeia para `HomeSegment[]` e delega ao carrossel; cabeçalho ("Compre por segmento" + "Ver todas as categorias") mantido.
- Verificado no navegador: 5 cards, `scrollWidth > clientWidth`, seta direita no início e **ambas** as setas após rolar (a esquerda surge quando `scrollLeft > 4`).

### 2. Ícone de acesso ao painel (header) — engrenagem → cadeado

`components/layout/site-header.tsx`: o ícone `Settings` (engrenagem) virou **`LockKeyhole`** (lucide) — mais moderno/minimalista e sinaliza área restrita/administrativa sem chamar atenção de usuários comuns. Mantidos posição (extremo canto direito em `2xl`), cor esmaecida (`/70`), `aria-label`/`title` "Painel administrativo" e destino `ROUTES.admin.login`. Comentário do componente atualizado (não menciona mais "engrenagem"). Verificado: `svg.lucide-lock-keyhole` no header.

### 3. Atalho "Ver site" no painel admin

`components/layout/admin-topbar.tsx`: novo botão **"Ver site"** (ghost, ícone `ExternalLink`) → `ROUTES.home`, no grupo direito junto de usuário/logout. Abre em **nova aba** (`target="_blank"`) para não perder o contexto do painel. Rótulo escondido no mobile (só ícone). Como a topbar aparece em todas as páginas admin, o atalho é global. (Render do admin não exercitável no preview — cookie cross-site, limitação já registrada; validado por type-check/lint.)

### 4. Página "Sobre" — hero no conceito da home + azuis consistentes + correção factual

- **Hero** (`app/(public)/sobre/page.tsx`): trocado o `bg-primary` chapado (com caixa de imagem vazia) pelo **mesmo conceito visual do hero da home** — fundo com `BRAND_HERO_GRADIENT` (importado de `hero-slides.ts`) + overlay de leitura à esquerda + acento vermelho radial (os **mesmos rgba** do `home-hero`). Removida a caixa de imagem placeholder. Verificado: `background-image` computado = `linear-gradient(135deg, #0e2c62 0%, #17479e 58%, #2159bd 100%)` — **idêntico ao hero da home**.
- **CTA final** da página passou a usar o mesmo `BRAND_HERO_GRADIENT` (antes `bg-primary`) para coesão.
- **Correção factual (só SP):** removida a informação incorreta de atuação em "3 estados / SP · MG · MS". Na faixa de números, o item "3 estados" virou **"Atendimento — consultivo e especializado"** (diferencial institucional, sem número inventado); labels ajustados para "municípios atendidos em São Paulo" e "3 unidades no interior de São Paulo". `metadata.description` deixou de citar MG/MS. O corpo "Nossa história" já citava só cidades paulistas (sem erro).

### 5. "Nossas Unidades" — CTA para cotação

`app/(public)/nossas-unidades/page.tsx`: o botão **"Falar com vendas"** (→ `/minha-cotacao`) virou **"Solicitar cotação"** apontando ao **catálogo** (`ROUTES.products`), incentivando o cliente a montar o orçamento em vez de só abrir contato. A mesma faixa também tinha a informação errada "3 estados / SP · MG · MS" — corrigida para **"Interior de SP — cobertura em todo o estado"** (consistente com a correção da Sobre). Verificado no navegador: CTA "Solicitar cotação" → `/produtos`, sem "Falar com vendas" nem "3 estados".

### Verificação

- `type-check` + `lint` + Prettier limpos.
- Navegador (público renderiza no preview): carrossel de segmentos rolando com setas; cadeado no header; hero da Sobre com degradê da marca + stats só de SP; Nossas Unidades com "Solicitar cotação" → catálogo e "Interior de SP". Erro transitório "Settings is not defined" durante a sessão era HMR obsoleto (linha inexistente no arquivo) — sumiu após reload; `GET / 200` sem erros.

Observação: a correção de "3 estados → SP" foi aplicada também em `/nossas-unidades` (além da Sobre pedida) por ser a mesma afirmação factualmente incorreta — manter só numa página deixaria o site inconsistente.

### Refinamento (mesma data) — hero da Sobre no padrão exato do hero da home (imagem estática)

A pedido da cliente, o hero da Sobre passou de "mesmo conceito" para a **mesma estrutura/tipografia/espaçamentos** do hero da home, porém **estático (uma imagem, sem carrossel)**:

- `app/(public)/sobre/page.tsx`: seção agora `flex min-h-[78svh] w-full items-center overflow-hidden bg-[#0e2c62]` (altura idêntica ao hero da home — verificado 624px em viewport 800). Fundo = **uma imagem estática** via `next/image` `fill priority` (constante `HERO_IMAGE`, hoje `"/images/hero/panificacao.png"`) com fallback ao `BRAND_HERO_GRADIENT` (`HERO_IMAGE = null`).
- Overlays azul (leitura) + acento vermelho radial **idênticos** aos do `home-hero` (mesmos rgba). Conteúdo com a mesma coluna (`max-w-7xl px-6 pt-28 pb-24 lg:px-10` → `max-w-2xl`), eyebrow com **linha vermelha inline** (`bg-brand h-px w-10` + texto `tracking-[0.32em] uppercase`, sem `font-mono`), `h1` display com as mesmas classes responsivas (`text-4xl … xl:text-6xl`) + ponto vermelho, subtítulo e **dois CTAs** no estilo do hero da home (primário vermelho "Ver produtos" → `/produtos`, contorno "Nossas unidades" → `/nossas-unidades`).
- **Sem** os selos de confiança do hero da home (evita duplicar a seção "Números" logo abaixo).
- Verificado no navegador: imagem carregada, 78svh, eyebrow-line 40px, CTAs corretos, sem overflow horizontal (desktop 1280 e mobile). `type-check` + `lint` + Prettier limpos.
- **Foto dedicada (opcional):** trocar `HERO_IMAGE` para `/images/sobre/hero.jpg` quando houver uma foto institucional própria (hoje reusa a foto de panificação do hero da home, mantendo a identidade fotográfica).

### Correção (mesma data) — Sobre: hero revertido ao original; consistência via MENU

A cliente esclareceu que **não** queria o hero da Sobre redesenhado. O hero (e o CTA final) foram **revertidos ao original** (`bg-primary` #17479e; hero em 2 colunas com placeholder de imagem `lg:block`) — supersede as duas entradas de hero da Sobre acima (conceito/gradiente e espelho estático). Removidos os imports que tinham sido adicionados (`Image`, `ArrowRight`, `BRAND_HERO_GRADIENT`) e a constante `HERO_IMAGE`.

- **Mantida** a correção factual de SP (stats sem "3 estados/MG/MS", metadata só SP) — é correção de dado explicitamente pedida antes, não faz parte do redesign revertido.
- **Única mudança de fato:** o **menu/cabeçalho** da Sobre agora segue o estilo da home — `components/layout/site-header.tsx` ganhou `HERO_ROUTES = [ROUTES.home, ROUTES.about]` e `hasHero = HERO_ROUTES.includes(pathname)` (antes `=== ROUTES.home`). Assim, na Sobre o header fica **transparente sobre o hero** (logo/links brancos) e vira **sólido ao rolar**, sem espaçador (o hero passa por baixo) — mesma mecânica já comprovada na home.
- Verificado (estilos computados; preview não rola/compõe screenshots — limitação registrada): no topo da Sobre o header é `position:fixed`, `bg rgba(0,0,0,0)`, sem sombra, logo `logo-mira-white.png`; hero `bg #17479e` em grid de 2 colunas; sem spacer após o header; sem overflow horizontal. Transição→sólido usa a lógica idêntica da home. `type-check` + `lint` + Prettier limpos.

### Ajustes finais na Sobre (mesma data) — azul do hero e foto da fachada

- **Base do hero igual à da home:** a cliente notou que o azul do hero da Sobre (`bg-primary` = `#17479e`, chapado) era mais claro que o da home (base `#0e2c62` + degradê + overlays). Trocado o fundo do hero da Sobre para **`bg-[#0e2c62]`** (mesma base escura da home) — verificado `rgb(14,44,98)`. O box decorativo do lado direito passou de `bg-primary/60` para `bg-white/5` (não vira um retângulo azul-claro sobre o fundo escuro). O **CTA final** foi mantido em `#17479e` (a cliente perguntou só sobre o hero; alinhável se ela quiser).
- **Foto da fachada na seção "Nossa história"** (não no hero — decisão da cliente): a imagem entrou na coluna de imagem à direita da "Nossa história". Para **não cortar** (a foto é paisagem 2:1 e o box antigo `min-h-80` esticava/cortava as laterais), troquei o box de altura fixa por um `<Image>` de **proporção natural** (`width`/`height` reais + `h-auto w-full`, `position: static`, sem `fill`/`object-cover`), **centralizado verticalmente** (`self-center`). A coluna da imagem foi alargada de `360px` → **`440px`** (`lg:grid-cols-[minmax(0,1fr)_440px]`) para a foto ter mais presença.
- **Arquivo:** `public/images/hero/fachada_hd.jpeg` (**2880×1440**, HD; substituiu a `fachada.jpeg` 1024×512 que a cliente removeu). `src`/`width`/`height` atualizados no código. Verificado: URL otimizada do `next/image` responde **200** (~247 KB na entrega). A imagem é *lazy* (abaixo da dobra) — carrega ao rolar; o preview não rola (limitação registrada), mas o arquivo serve corretamente.
- `type-check` + `lint` + Prettier limpos.

**Referência de tamanhos de imagem (para a cliente):**

- **Banner do hero da home** (fundo full-screen): ~**2400×1400** (paisagem, JPG/WebP), assunto centralizado, lado esquerdo com espaço para o texto; o hero dá zoom Ken Burns (até 1,16×) e pede `sizes="116vw"`.
- **Foto da "Nossa história" (Sobre):** proporção **livre** (sem corte, a caixa se adapta), largura **~1200–1600px** (coluna de 440px, folga para retina), JPG/WebP.
- **Card "Compre por segmento" (home):** proporção **4:3**, **~800×600** (recorte `object-cover` centralizado); vem da imagem da categoria no painel.
- **Box de imagem do hero da Sobre** (hoje vazio, se um dia usar): **4:3**, ~1200×900 (recorte centralizado).

---

## 2026-07-22 — Descrição em editor rich text (WYSIWYG) + layout da descrição sem tabela + Produtos relacionados

Três entregas na página de detalhe do produto e no cadastro. Sem migração de banco — `Product.description` continua `String` (agora guarda **HTML** em vez de texto puro).

### 1. Editor rich text (WYSIWYG) para a descrição no painel

- **TipTap 3.28** (ProseMirror). Pacotes: `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-text-style` (traz o `TextStyleKit`: TextStyle, **Color**, **FontSize**, FontFamily, BackgroundColor, LineHeight), `@tiptap/extension-text-align`. **Link e Underline já vêm no StarterKit v3** (habilitados por padrão) — não instalei os pacotes avulsos.
- `components/shared/rich-text-editor.tsx` (client) substitui o `<Textarea>` da descrição em `product-form.tsx`. Toolbar: parágrafo/títulos **H1–H3** (select), **tamanho de fonte** (select), **cor** (input color), **negrito/itálico/sublinhado/tachado**, **listas** (marcadores/numerada), **alinhamento** (esq/centro/dir/justificado), **link** (prompt) e quebras nativas. `immediatelyRender: false` (SSR do App Router). Estados ativos via `useEditorState`.
- **Serialização sem mudar o action:** o editor grava o HTML num `<input type="hidden" name="description">`; quando vazio (`getText().trim() === ""`) grava `""` → cai no `min(1)` do Zod (obrigatório). `product-actions` lê `formData.get("description")` como antes.
- Schema: `description` `max` 5000 → **20000** (overhead de tags). Descrições legadas (texto puro) continuam válidas — ao editar, carregam no editor; se salvas sem alteração, permanecem texto puro (sem perda).

### 2. Descrição ocupa a coluna da tabela quando não há tabela nutricional

- **`lib/sanitize-html.ts`** (server-only, `sanitize-html` 2.17): allowlist de tags/atributos + `allowedStyles` (só `color`, `background-color`, `font-size`, `text-align`), esquemas `http/https/mailto/tel`, links com `rel="noopener noreferrer" target="_blank"`. `renderRichText()` sanitiza HTML do editor **na renderização** (defesa na saída) e converte **texto legado** (sem tags) em parágrafos preservando quebras. Estilos em `.rich-content` no `globals.css` (títulos, listas, links, blockquote) — cor/tamanho/alinhamento inline do editor aplicam por cima.
- `features/catalog/components/product-description.tsx` (server) renderiza a seção "Detalhes do Produto" sanitizada.
- **Layout (resolve o espaço em branco):** na página de detalhe, produto **sem nenhuma tabela** (do produto ou de sabor) agora usa o grid **40/60** (`lg:grid-cols-[2fr_3fr]`) com galeria+cotação à esquerda e a **descrição na coluna direita** — o lugar onde ficaria a tabela —, sem coluna vazia. **Com tabela**, a tabela fica à direita e a descrição vai para a **faixa inferior** (como antes). Vale também para produtos com sabores: `FlavorProductView` recebe a descrição e a mostra na direita quando não há tabela.
- `metaSummary` (SEO) passou a **remover tags HTML** antes de resumir a descrição.

### 3. Seção "Explore outras categorias" (fim da página)

Decisão da cliente (supersede a ideia inicial de "Produtos relacionados"): em vez de recomendar produtos específicos, incentivar a navegação pelo **catálogo por categorias**.

- `features/catalog/components/explore-categories.tsx` (server async) — busca `listActiveCategoryTree()`, **exclui a categoria do produto atual** (são "outras") e reaproveita o `HomeSegmentsCarousel` (mesmos cards clicáveis → `/produtos?categoria=slug`, com imagem/subcategorias). Some se não sobrar nenhuma categoria. Renderizada no fim da página de detalhe.
- **Removido** o que foi feito antes nesta mesma sessão para "Produtos relacionados": `getRelatedProducts`/`RelatedProductsQuery` (catalog-service), `features/catalog/components/related-products.tsx` e `components/shared/card-carousel.tsx` (dead code). `CATALOG_CARD_SELECT` permanece (usado por `listPublicProducts`).

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Navegador (público renderiza no preview):** produtos sem tabela (`desmoldante-600ml`, `pao-de-cebola-501kg`, `creme-chantilly-choc-1kg`…) usam grid computado **`2fr 3fr`** com a descrição (`.rich-content`, conteúdo real) na coluna direita e **uma só** "Detalhes do Produto" (sem faixa inferior); `barra-de-proteina-ruby` (com tabela + sabores) mantém tabela à direita + descrição na faixa inferior (sem duplicar). "Explore outras categorias" mostra as 4 outras categorias raiz (exclui a do produto — verificado dinâmico em vários produtos), cada card → `/produtos?categoria=slug`. Sem erros de console/servidor; sem overflow horizontal. (Larguras em px não mensuráveis — a pane não compõe frames, glitch já registrado; `grid-template-columns` resolvido e a estrutura são conclusivos.)
- **Editor no painel não exercitável no preview** (rota admin cai no `/login` por cookie cross-site — limitação já registrada); integração validada por type-check/lint e pelos nomes de comando conferidos na versão instalada (`setHeading`/`setFontSize`/`setColor`/`setTextAlign`).

Decisão de layout (aberta a ajuste): sem tabela, a descrição ocupa a **coluna direita 60%** (lugar da tabela). Se a cliente preferir a descrição em **100% da largura** abaixo de uma linha compacta galeria+cotação, é um ajuste pequeno no grid.

Pendências que seguem: interatividade do editor a validar em same-site/produção; as demais anteriores (números de marketing, modo escuro, `/contato` 404).

---

## 2026-07-22 (imagens) — Imagens dos segmentos (categorias) + banners do hero

Inserção de assets fornecidos pela cliente. Nenhuma mudança de código de lógica; só assets + `imageUrl` das categorias.

### Imagens dos segmentos (categorias)

- 5 cards de segmento (800×600, 4:3, overlay azul da marca + ícone + rótulo) colocados em `public/uploads/categories/` e **renomeados para nomes web-friendly** (minúsculo, sem acento/espaço, casando com o slug): `confeitaria.png`, `embalagens-e-equipamentos.png`, `lacteos-gorduras-e-ingredientes.png`, `padaria-salgados-e-negocios-de-alimentacao.png`, `panificacao.png`. Cada um associado ao `Category.imageUrl` da respectiva categoria raiz (via script `tsx` pontual, já removido). Aparecem na home ("Compre por segmento") e em "Explore outras categorias".
- **Gotcha registrado:** Windows é case-insensitive, então `Confeitaria.png` "já existia" como `confeitaria.png` no rename — precisei forçar a troca de caixa em dois passos (`mv a tmp && mv tmp a`) para o arquivo ficar minúsculo **no disco** (senão a URL `/uploads/categories/confeitaria.png` daria 404 na VPS Linux, que é case-sensitive).
- **Produção:** `public/uploads` é gitignorado (volume persistente). O que foi feito vale para o ambiente de dev; em produção a cliente deve subir as imagens pelo painel (Categorias → editar → imagem), que grava no volume e no `imageUrl`.

### Banners do hero (6 slides) — supersede a pendência "produzir/colocar fotos do hero"

- As 6 fotos definitivas (2400×1400, assunto à direita, área escura à esquerda p/ o texto) entraram em `public/images/hero/` renomeadas por **id do slide**: `food-service.png`, `panificacao.png`, `confeitaria.png` (imagem de ingredientes), `sorveterias.png` (baldes de sorvete), `centro-distribuicao.png`, `equipe-comercial.png` (equipe com camisa Mira). `hero-slides.ts`: `image`+`imageAlt` preenchidos nos 6 slides (slides 1/5/6 ganharam `image`; 3/4 mantiveram o caminho e tiveram o `alt` atualizado). `public/images/hero` **não** é gitignorado (assets versionados, seguem no build/deploy — diferente das imagens de categoria).
- Verificado no navegador: os 6 slides renderizam via `next/image` (`loaded=true`), todos os arquivos servem 200; `type-check`/Prettier limpos; sem erros de console.
- **Otimização recomendada (opcional):** os PNGs somam ~25 MB (3–5 MB cada). O `next/image` otimiza a *entrega* (WebP/resize), mas o arquivo bruto pesa no repo/deploy. Converter para JPG/WebP (~q80) reduziria ~25 MB → ~2–3 MB. Não feito para não reencodar o asset da cliente sem aval.

### Imagens da página Sobre — HERO (nova) + "Nossa história" (fachada restaurada)

- **Hero da Sobre:** a cliente enviou uma imagem nova (cena de padaria/confeitaria — pães, bolos, cupcakes, tortas) → `public/images/hero/sobre-historia.png` (renomeada de `1200x900 (1).png`, 1200×900 / 4:3). Colocada no **HERO** (`app/(public)/sobre/page.tsx`), preenchendo o box 4:3 que era um placeholder vazio (`bg-white/5`, `lg:block`), via `next/image` `fill object-cover priority`.
- **"Nossa história":** o `fachada_hd.jpeg` **não estava perdido** — tinha sido movido para `public/uploads/categories/` (por isso dava 404 no hero). Devolvido para `public/images/hero/fachada_hd.jpeg` e a seção **restaurada ao layout original** (grid 2 colunas `lg:grid-cols-[minmax(0,1fr)_440px]` + `Image` 2880×1440, alt "Fachada da Mira Distribuidora"). Lição: quando um asset referenciado "some", procurar o arquivo no projeto antes de alterar o layout — não remover a seção.
- Verificado: hero com `sobre-historia.png`, "Nossa história" com `fachada_hd.jpeg` (2 colunas), ambos servem 200, `type-check` limpo, sem erros de console.

---

## 2026-07-25 — Hero da Sobre reformulado, card sem corte, auditoria de responsividade, imagens dos segmentos e carrossel

Sessão longa de refino visual + correções estruturais. Nenhuma mudança de schema/DB.

### Página "Sobre" — imagem "Nossa história" e HERO reformulado

- **Imagem "Nossa história"** (`app/(public)/sobre/page.tsx`): recebeu o mesmo tratamento do hero — `shadow-2xl shadow-black/40 ring-1 ring-white/10` (sombra suave + borda discreta; `rounded-2xl` mantido). Decisão: o `ring-white/10` fica ~invisível sobre fundo claro, mas foi aplicado igual ao hero a pedido da cliente (mesmas classes).
- **HERO reformulado — de 2 colunas para imagem de fundo sobreposta** (conceito do hero da home, sem copiar): a imagem deixou de ficar em coluna ao lado e virou **plano de fundo full-width** (`next/image fill object-cover`) com **overlay escuro** (azul da marca, mais forte à esquerda p/ legibilidade) + texto sobreposto à esquerda. `section` virou `flex items-start ... lg:min-h-[600px]` — **altura ~mantida (600px desktop)**; no mobile o texto dirige a altura (a imagem antes era `lg:block`/oculta no mobile).
- **Refinamentos do hero** (iterados com a cliente):
  - Conteúdo descido ~48px (`pt-36 lg:pb-12` + `items-start`) para respiro da navbar, mantendo 600px.
  - **Overlay** ajustado várias vezes (esquerda destaca a frase, direita mostra os produtos); valor final do gradiente horizontal: **`0.90 → 0.72 → 0.50`** (rgba de `#091a3e`) + escurecimento vertical sutil + acento vermelho no canto sup-direito.
  - `object-position` **`70% 40%`**: tira o bolo principal de trás do título (composição equilibrada).
  - **Transição para os "Números":** a seção de números **sobe 24px sobre o hero** (`relative z-10 lg:-mt-12 lg:pt-6` em `app/(public)/sobre/page.tsx`) — conceito da home (cards flutuantes), sem alterar a altura do hero. Escolhida essa opção em vez de aumentar `pb` do hero (que mudaria a altura).
  - Largura do texto: parágrafo `max-w-xl`→**`max-w-[620px]`**, container `max-w-2xl`→`max-w-[640px]` (quebra de linha mais tarde).

### Card de produto — imagem sem corte (`object-contain`)

- `features/catalog/components/product-card.tsx`: a imagem passou de **`object-cover`** (recortava embalagens altas/largas) para **`object-contain p-4`**. Mostra o produto inteiro, centralizado, sobre `bg-muted`; o container `aspect-square` mantém todos os cards do mesmo tamanho (grid alinhado). Verificado desktop/mobile: containers 286×286 uniformes, produtos completos.

### Auditoria de responsividade (bug flexbox/grid `min-width: auto`)

Varredura de **overflow horizontal** em 320/375/768/1280/1536px nas páginas públicas. Corrigido o clássico "item flex/grid com `min-width:auto` cresce até o conteúdo (carrossel/tabela) e vaza a página". **Correção idiomática = `min-w-0` no item + `minmax(0,…)` nos tracks do grid.** Casos corrigidos:

- **Home "Compre por segmento"** (`components/home/home-segments.tsx`): `w-full min-w-0` na section (vazava 905px em 375).
- **Detalhe do produto** (`app/(public)/produtos/[slug]/page.tsx`) e **`flavor-product-view.tsx`**: `min-w-0` na coluna esquerda + grids `lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]` (o carrossel de sabores empurrava o track a 612px). ⚠️ gotcha: o `replace_all` pegou só uma das duas ocorrências no `flavor-product-view` por causa da indentação diferente entre os dois `return` — conferir ambas.
- **Filtro de categorias** (`category-filter.tsx`): chips raiz em `flex-wrap` com nome longo ("Padaria, Salgados e negócios de alimentação") estouravam em 320px. Chips raiz agora podem **quebrar linha** (`min-h-10 max-w-full py-1.5`, sem `nowrap`/`shrink-0`); a barra de subcategorias (scroller) mantém `nowrap`/`shrink-0`. Parametrizado via `allowWrap` no helper `chip`.
- **Minha cotação** (`features/quote/components/quote-cart-view.tsx`): grid `lg:grid-cols-[minmax(0,1fr)_minmax(360px,420px)]` + `min-w-0` nos dois itens (com itens no carrinho vazava 26px em 375).
- **Layout admin** (`app/(admin)/layout.tsx`): `min-w-0` na coluna `main` (`flex-1`) — tabelas largas (que já usam `overflow-x-auto` no primitivo `Table`) agora rolam em vez de quebrar a página no mobile.
- **Admin detalhe da cotação** (`app/(admin)/admin/cotacoes/[id]/page.tsx`): grid `1fr_340px`→`minmax(0,1fr)_340px` + `min-w-0`.
- Todas as páginas públicas verificadas com `scrollWidth == clientWidth` em todos os breakpoints.

### Ajustes globais (navbar)

- **Logo +5%:** `components/layout/logo.tsx` — `next/image` 97×32 → **102×34** (todas as variantes). Comentário atualizado.
- **Botão "Minha cotação":** `features/quote/components/quote-cart-button.tsx` — hover com `transition-all duration-200 ease-out hover:scale-[1.03]` + sombra vermelha suave (`hover:shadow-md hover:shadow-brand/30`).

### Imagens dos segmentos (categorias) — regrade e nova leva

A cliente forneceu **novos conjuntos** de imagens (estilo duotone azul + ícone neon branco). Fluxo e decisões:

- **Aplicação:** mapear cada imagem à categoria por conteúdo, renomear para o **nome-slug** que o banco referencia (`Category.imageUrl` = `/uploads/categories/<slug>.png`), padronizar em **1000×1000** (cortar as paisagem para quadrado central). Banco **não muda**.
- **⚠️ Cache do `next/image`:** ao trocar o arquivo mantendo a MESMA URL, o Next serve a versão otimizada antiga em cache — **rodar `rm -rf .next/cache/images`** (dev) após substituir a imagem; senão aparece a imagem antiga (aconteceu: rótulo embutido de uma versão anterior "voltou").
- **Unificação de tom (sharp):** o 1º conjunto vinha em 2 grupos de brilho. Técnicas usadas (documentadas para reuso):
  - **Escurecer preservando o ícone branco:** `linear` **por canal** (`[aR,aG,aB],[bR,bG,bB]`) — escurece/aprofunda o fundo e **clipa o branco em 255** (mantém o ícone), em vez de `modulate({brightness})` global (que dimava o ícone).
  - **Reduzir o glow do ícone:** `linear(a<1, b>0)` comprime os altos-luzes (glow/traço 255→~185) preservando o fundo navy.
  - **Uniformizar foco:** `sharpen({sigma, m1 baixo, m2})` nas fotos com fundo mais desfocado (bokeh) — `m1` baixo evita amplificar granulado; não "refoca" 100% (é profundidade de campo da foto), o granulado some no tamanho do card.
  - **Medir com `stats()`** (luminância = 0.299R+0.587G+0.114B) para calibrar.
  - **⚠️ Gotcha:** clarear demais uma foto muito escura (ex.: `modulate brightness ~1.67`) **desvia o tom para roxo/violeta** — evitar; ajuste por canal é mais seguro.
- **Decisão final da cliente:** a última leva de imagens ficou **aplicada como está** (navy escuro, consistente entre si) — sem forçar o clareamento pro tom do site (que virava roxo). Originais em `public/uploads/categories/não usar/` (reversível). Ícone glow forte mantido.

### Carrossel "Compre por segmento" (`components/home/home-segments-carousel.tsx`)

- **Rolagem por página:** o passo das setas mudou de "um card" (`offsetWidth + gap`) para **`el.clientWidth`** (uma "página"). Como o `scrollBy` é limitado ao máximo e há poucos segmentos, **um clique já chega ao fim** e mostra o último card inteiro — sem cards cortados nem segundo clique. Removida a constante `GAP` (não mais usada). Verificado: 1 clique → `scrollLeft` = `maxScroll`, último card 100% visível, seta somem no limite.
- **Setas transparentes:** removidos `bg-background/90`, `border`, `shadow-md`, `backdrop-blur`; ficou só o **chevron branco** (`text-white/90 hover:text-white`) com `drop-shadow-md` sutil (legibilidade sobre as imagens navy). Fundo `rgba(0,0,0,0)`.

### Verificação

- `type-check` + `lint` limpos em todos os arquivos alterados; fluxos verificados no navegador (a sessão do preview estava com hidratação funcionando — cliques nas setas do carrossel exercitados de fato).

Pendências que seguem: números de marketing a confirmar, modo escuro, `/contato` (404); produção (domínio/e-mails oficiais, Resend com domínio verificado, senha admin, deploy — lembrar `migrate deploy` + `generate` e volume `public/uploads` na VPS).

---

## 2026-07-27 — Redesign completo da página de Produtos (catálogo + detalhe) + novos campos no painel

Reforma da página de Produtos ao nível de acabamento de Home/Sobre, guiada por um mockup fornecido (`public/layout de referencia.png`). Escopo total: página pública, componentes, e **banco + painel** (a cliente autorizou mexer na estrutura; escolheu "tudo agora" para os campos extras e **vermelho** para o CTA de cotação).

### Banco — migração `20260727_products_redesign_fields` (aplicada, 100% aditiva)

Gerada por `migrate diff --from-config-datasource prisma.config.ts --to-schema prisma/schema.prisma --script` (flag `--to-schema-datamodel` foi **removida** no Prisma 7 — usar `--to-schema`) + `migrate deploy` + `generate` + restart do dev (gotcha do client em memória). Só ADD COLUMN + 1 tabela de junção — nenhum dado perdido:

- `Product.weight String?` (peso), `Product.preparation String?` (modo de preparo, HTML), `Product.highlights String[]` (destaques/benefícios), auto-relação N:N `relatedProducts`/`relatedFrom` (produtos relacionados, tabela `_RelatedProducts`). `shortDescription` **já existia** (religado no form).
- `Category.bannerUrl String?` (banner largo, reservado p/ futuro).
- `Supplier.order Int @default(0)` (ordena vitrines de fornecedores; `listSuppliers`/`listActiveSuppliers` passaram a ordenar por `order` depois `name`).

### Página de listagem (`/produtos`) — reescrita

- **Faixa institucional** (nova, no lugar do header simples): azul da marca `#0e2c62` + gradiente/textura discretos + acento vermelho, altura reduzida (`pt-24 lg:pt-28 pb-12`), título "Produtos." com ponto vermelho + traço + descrição (texto da cliente). Sem imagem de fundo. **`/produtos` entrou em `HERO_ROUTES`** (`site-header`), então a navbar fica transparente sobre a faixa e sólida ao rolar (mesma mecânica de Home/Sobre; a rota de detalhe `/produtos/[slug]` **não** casa no `.includes(pathname)`, então mantém header sólido — correto).
- **Painel de filtros unificado** (`catalog-filter-panel.tsx`, Server, card branco `rounded-2xl` + sombra): reúne busca + categorias + fornecedores num só bloco.
  - `catalog-search-field.tsx` (client, novo): "Pesquisar produtos..." com debounce 400ms → `?q=`. A busca do service (`listPublicProducts`) ganhou **nome do fornecedor** no `OR` (além de nome/SKU/descrição).
  - `CategoryFilter` (pills 2 níveis, já existia) sob rótulo "Categorias"; `SupplierSection` (logos, já existia) perdeu o header interno (o painel é dono do rótulo "Fornecedores").
- **Barra de resultados**: "N produtos encontrados" + **"Ordenar por"** (`catalog-sort.tsx`, novo → `?ordenar=` relevância/nome/recentes; `SORT_ORDER_BY` no service).
- **Cards refinados** (`product-card.tsx`): `rounded-2xl`, borda, sombra suave, hover (eleva + zoom da imagem em `object-contain` sobre fundo branco), "Categoria · Fornecedor" + nome (`font-display`) + botão. Botão de cotação (`card-add-to-quote-button`): **outline vermelho** da marca ("Adicionar à cotação"); produto com sabores vira "Escolher sabor".
- **Paginação numerada** (helper `pageWindow` com elipses; página ativa = círculo azul; setas ‹ ›).
- `product-filters.tsx` (antigo "Limpar filtros") ficou órfão → **removido**.

### Página de detalhe (`/produtos/[slug]`) — reorganizada

- **Sem sabores** (caso do mockup): grade `lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]` (galeria | infos). Galeria (`product-gallery.tsx`) ganhou **setas + caixa branca com borda** e miniatura ativa com anel azul. Coluna direita: categoria·subcategoria, nome (`font-display`), **fornecedor em azul uppercase**, descrição resumida, **destaques com ✓**, **box de specs** (Embalagem/Peso/Código/Unidade/Fornecedor/Categoria — só os preenchidos), e **CTA vermelho** "Adicionar à cotação" (`add-to-quote-button` agora usa `bg-brand`). Abaixo: **Descrição do produto (+ Modo de preparo)** | **Tabela nutricional** (ANVISA, mantida) quando há tabela; sem tabela, descrição ocupa a largura de leitura.
- **Com sabores**: `FlavorProductView` (carrossel de sabores + nutrição por sabor) **preservado intacto**, agora sob o cabeçalho premium (nome/fornecedor/resumo/destaques) e recebendo o box de specs restyled.
- Novos parts (`product-detail-parts.tsx`): `ProductSpecs`, `ProductHighlights`, `ProductHelpCta` (faixa "Falar com um consultor" → WhatsApp das Settings se houver, senão `/minha-cotacao`). `product-description.tsx` ganhou prop `title` (reusado p/ "Descrição do produto" e "Modo de preparo").
- **Produtos relacionados** (`related-products.tsx`, novo): carrossel de `ProductCard`s, exibido só quando o produto tem relacionados. A seção "Explore outras categorias" (carrossel de categorias, seção 6 do pedido) foi **mantida** abaixo.

### Painel administrativo

- **Produto** (`product-schema`/`product-actions`/`product-service`/`product-form` + páginas novo/editar): novos campos — descrição resumida, peso, modo de preparo (editor rico), destaques (textarea, um por linha), e **produtos relacionados** (`related-products-field.tsx`, chips + select, hidden JSON). `getProductById` inclui `relatedProducts`; `listProductOptions` alimenta o seletor (exclui o próprio na edição). `updateProduct` usa `relatedProducts: { set }` (substitui a lista); highlights vazios são descartados.
- **Categoria**: campo **Banner** (`SingleImageUpload`, pasta `categories`); service persiste/limpa `bannerUrl` (create/update/delete).
- **Fornecedor**: campo **Ordem de exibição**; service persiste `order`.

### Identidade / decisões

- CTA de cotação = **vermelho `#ed1c24`** em todo o funil (cards, detalhe) — decisão da cliente (a referência mostrava azul no detalhe; seguimos o vermelho de ações). Azul `#17479e` nos estados ativos (pills, paginação, foco). Tipografia Public Sans + Archivo (`font-display`), radius/espaçamentos de Home/Sobre.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Navegador (público renderiza no preview)**: listagem com faixa azul (#0e2c62, navbar transparente por cima), painel branco (busca + "Categorias" pills + "Fornecedores" logos), "Ordenar por" (default relevância), 6 cards `rounded-2xl` com botão **vermelho** `#ed1c24`, sem overflow (desktop 1280 / mobile 375, grid 2 col). Detalhe (Bolo de Aipim, sem sabor): breadcrumb, grade 5fr/6fr, galeria, badge de fornecedor, box de specs (Peso omitido quando vazio), CTA vermelho, faixa de ajuda, explore. Detalhe com sabores (Barra de Proteína Ruby): picker + 8 sabores + tabela nutricional preservados. Sem erros de console. (Alturas em px não medíveis — glitch de layout do preview já registrado; estrutura/estilos computados são conclusivos.)
- **Painel validado por script `tsx`** (round-trip no banco de dev, 11 checks): persistência de `weight`/`shortDescription`/`preparation`/`highlights` (vazios descartados), `relatedProducts` connect e `set:[]`, `Category.bannerUrl`, `Supplier.order`, e limpeza (nenhum `zztmp` restante). Render do form admin não exercitável no preview (cookie cross-site — limitação registrada).

Observações: `_RelatedProducts` é auto-relação implícita (grava direcional A→B; a UI edita/exibe `relatedProducts`). ⚠️ Deploy: aplicar `migrate deploy` + `generate` antes de subir. Quem tiver um `next dev` próprio rodando precisa **reiniciar** (client regenerado com os novos campos). Pendências anteriores seguem (números de marketing, modo escuro, `/contato` 404).

### Cadastro de produtos reais Adimix (dados de dev)

A partir das fotos em `C:\Produtos Mira\CATALOGO FOTOS\CATALOGO FOTOS\ADIMIX\`, foram cadastrados **13 produtos Adimix reais** (via script `tsx` contra o banco de dev — o painel não renderiza no preview por cookie cross-site) com **informações reais do fabricante** (site Adimix + distribuidor Ameripan) e as **fotos oficiais** copiadas para `public/uploads/products/`. Fornecedor **Adimix**, status ACTIVE.

- **Únicos:** AdiMix Super 2kg, Mistura para Pão de Queijo 25kg, Pão de Batata 5kg, Brioche 5kg, Concentrado Pão Australiano 10kg, Pão Francês Integral 5kg, Creme Confeiteiro em Pó 1kg, Fondant 1kg, Marshmallow.
- **Com sabores (recurso de flavors):** Bolo Cremoso 5kg (12 sabores), Granfil Recheio e Cobertura (10), Ganache 4kg (4), Chocolisse Cobertura (4) — 30 sabores no total, cada um com foto própria.
- **Pão de Queijo 25kg** tem **composição + modo de preparo reais** (transcritos do rótulo na foto) na descrição.
- **Decisão (confirmada com a cliente):** onde não havia dado oficial confiável, deixei **em branco** (nunca inventei). Então **SKU e tabela nutricional estruturada ficaram vazios** em todos — as fotos "front" (marketing) não trazem rótulo, e a do pão de queijo só tem coluna por 100 g (sem porção/%VD, que a tabela ANVISA exige). A cliente completa pelo painel a partir das embalagens.
- Categorias: itens de pão em **Panificação**; recheios/coberturas/bolos/cremes em **Confeitaria** (as 5 categorias raiz reais já existem no dev).
- Verificado no navegador: listagem `/produtos?fornecedor=adimix` (15 itens — inclui 2 demos antigos), CTAs corretos ("Escolher sabor" nos multi-sabor), detalhe do Pão de Queijo (imagem + composição + preparo) e do Bolo Cremoso (12 sabores no carrossel). Fotos servem 200 (`/uploads/products/*`). Imagens de carrossel/abaixo da dobra não "pintam" no preview (glitch de layout já registrado), mas o DOM/rede confirmam.

### Correção de layout dos produtos COM sabores (FlavorProductView)

A cliente apontou que os produtos com sabores estavam "saindo errado". Ao **ver de fato pelo Chrome real da cliente** (`mcp__claude-in-chrome__` — o screenshot do preview embutido segue travando; usei o browser real para enxergar), dois problemas no `flavor-product-view.tsx` para produtos **com sabores e SEM tabela nutricional** (caso de todos os Adimix acima):

1. **Carrossel espremido + vazio à direita:** o branch `!hasAnyTable` usava grid 2fr/3fr com `[galeria, picker, specs]` na coluna esquerda (2fr) e a descrição na direita — o carrossel de sabores ficava cramado em ~40% e sobrava um vão branco enorme à direita.
2. **Fotos dos sabores cortadas:** os cards de sabor usavam `object-cover` (recortava os sacos/baldes).

Correção (layout único, sem os dois branches antigos): **bloco superior** galeria (esq., 2fr) | **specs + descrição** (dir., 3fr) — preenche a coluna; **carrossel de sabores em LARGURA TOTAL** abaixo (respira, mostra ~6 cards); **tabela nutricional** do sabor selecionado em faixa própria abaixo (só quando há alguma tabela). Cards de sabor: `object-cover`→**`object-contain`** + `bg-white` + `rounded-2xl` + sombra (fotos inteiras, uniformes). A descrição passou a ser **sempre** exibida pela própria view (topo-direita) — removida a faixa de descrição duplicada que a página renderizava no fim para o caso com tabela.

Verificado no Chrome real (Bolo Cremoso = sacos; Granfil = baldes): topo equilibrado, carrossel full-width com fotos inteiras e sabor ativo com anel azul, faixa de ajuda e "Explore outras categorias" abaixo. `type-check` + `lint` + Prettier limpos.

> Nota de processo: o glitch de composição do **preview embutido** impede screenshots (verifiquei redesign por DOM/estilos, que é conclusivo p/ estrutura mas **não revela desequilíbrio visual**). Para telas onde a estética importa, usar o **Chrome real da cliente** (`claude-in-chrome`) para inspeção visual.

### FlavorProductView v2 + imagem principal reativa + compressão de imagens

Ajustes pedidos pela cliente vendo a tela ("info em cima do produto não deve ficar lá", "ao clicar no sabor ele apareça na imagem principal", "barra de rolagem grande"):

- **Imagem principal reflete o sabor selecionado:** o `FlavorProductView` deixou de receber a `gallery` estática (imagens do produto) e passou a renderizar a **imagem principal reativa** = `selected.imageUrl ?? fallbackImage`, com chip do sabor no canto e `key` p/ trocar ao clicar num sabor. (Antes a imagem principal era a galeria do produto e não mudava com o sabor.)
- **Cabeçalho não fica mais acima da imagem:** os destaques/resumo (o `lead`) saíram do bloco full-width acima e foram para a **coluna direita** do bloco superior (ao lado da imagem), espelhando a página sem sabores. Layout: `[imagem 5fr | lead+specs 6fr]` → carrossel de sabores → (descrição | tabela do sabor selecionado).
- **Carrossel compacto:** cards de sabor `w-44`→**`w-32/w-36`**; scrollbars já ocultas (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`) — não havia barra visível no código, a "faixa grande" era o tamanho dos cards.
- **Fotos dos sabores sem corte:** `object-cover`→`object-contain` + `bg-white` (já na rodada anterior).

**Causa real do "imagem principal vazia":** as fotos copiadas para `public/uploads/products/` eram **enormes** (2–13 MB cada; a principal com `priority` demorava a ser otimizada pelo `next/image` e aparecia em branco). Comprimi/redimensionei todas para **máx. 1000px** (mesmo nome/caminho — o banco referencia estes paths; originais em `C:\Produtos Mira` intactos): **81,9 MB → 7,1 MB** (46 de 47). Rodar `rm -rf .next/cache/images` após recomprimir. Verificado: imagem principal carrega (naturalWidth ~589) e o layout confere (grid 5fr/6fr, destaques à direita, sem overflow).

⚠️ **Achado:** havia uma **cópia inteira da pasta `CATALOGO FOTOS` (~393 MB) dentro de `public/uploads/products/`** (origem desconhecida — não criada pelos scripts, que copiam arquivos individuais). Não é referenciada por nenhum produto e infla o `public/`; remover (originais seguros na pasta da cliente). Pendente de confirmação da cliente.

> Processo: o **Chrome real esteve instável** nesta rodada (renderer congelou, imagens intermitentes). A verificação conclusiva veio do **DOM do preview interno** (naturalWidth/estilos). Screenshots do Chrome real ajudaram a enxergar o problema mas não são confiáveis quando ele trava.

### Barra de rolagem global fina (globals.css)

A cliente reclamou 2× de "barra de rolagem muito grande / desproporcional / esquisita". No código não havia barra visível nas carrosséis (todas com `scrollbar-width:none`) — **zoom no Chrome real revelou que era a barra de rolagem NATIVA do Windows** (larga e escura), destoando do layout. Adicionado ao `globals.css` um estilo **global** de scrollbar fina/discreta: `* { scrollbar-width: thin; scrollbar-color: … }` + `*::-webkit-scrollbar{width:10px}` com thumb `color-mix(--foreground 20%)` arredondado e track transparente. As carrosséis que ocultam a barra (classe `[scrollbar-width:none]`, maior especificidade que `*`) continuam sem barra. Verificado no Chrome real (zoom): thumb fino cinza-claro no lugar da faixa escura larga. **Lição:** "barra de rolagem grande" era a nativa do SO — só dá pra diagnosticar VENDO a tela (zoom no Chrome real), não pelo DOM.

---

## 2026-07-28 — Redesign da página de detalhe, variações como característica, documentos inteligentes e refactor do painel

Redesign profundo (não adaptação) da página de Produtos/detalhe ao nível de Home/Sobre, guiado por crítica de UX. A cliente pediu: variações = característica do mesmo produto (não mini-catálogo), documentos com exibição inteligente, painel administrando tudo, hierarquia clara e consistência visual.

### Banco — migração `20260728_products_variation_fields_techsheet` (aditiva, sem perda)

Gerada por `migrate diff --from-config-datasource … --to-schema … --script` + `migrate deploy` + `generate` + restart do dev (gotcha do client em memória).

- `Product` += `technicalSheetUrl`, `composition`, `application`, `conservation` (HTML). **Reintroduz a ficha técnica** (havia sido dropada em 2026-07-12) — agora aceita PDF **ou** imagem.
- `ProductFlavor` promovido a **variação completa** += `sku`, `description` (HTML), `weight`, `technicalSheetUrl`, `available` (Boolean, default `true`). SKU do sabor **sem `@unique`** (evita colisão cross-table e atrito com nulos).

### Armazenamento — PDF na ficha técnica

- `UPLOAD_FOLDERS` += `"documents"`; `local.ts` mapeia `application/pdf`→`.pdf`; `lib/storage/index.ts` ganhou `allowedTypesForFolder`/`allowedLabelForFolder` (só a pasta `documents` aceita PDF+imagem; demais seguem só imagem). Rota `/api/admin/upload` valida por pasta. `cleanup.ts` (`isUploadPathInUse`) passou a contar `Product.technicalSheetUrl` e `ProductFlavor.technicalSheetUrl`. Teto 20 MB (Nginx `client_max_body_size` já registrado).

### Página de detalhe — componente único, variação reativa (supersede `flavor-product-view`)

- **Removidos** `flavor-product-view.tsx` e `add-to-quote-button.tsx`. Novo `features/catalog/components/product-detail-view.tsx` (client) trata produto **com e sem** variações — sem variações = variação-padrão derivada do produto (zero duplicação, sem o vão branco antigo).
- **Seletor de variação compacto** (miniaturas horizontais roláveis, setas no overflow) — não mais carrossel gigante com botão por sabor. Selecionar troca de forma reativa: **imagem principal, SKU, peso, descrição, tabela nutricional e ficha técnica** (variação sobrepõe o produto; cai no produto quando vazia). Marca as variações já na cotação (✓) e desabilita as indisponíveis (`available:false`).
- **CTA único**: seletor → quantidade → "Adicionar à cotação" (vermelho da marca). Mantém multi-sabor no carrinho (re-selecionar e adicionar; `productId+flavorId`).
- **Sem repetição**: categoria só no breadcrumb; fornecedor na linha de marca; **SKU em destaque** (pílula "Cód. X" + specs). Box de specs = SKU · Embalagem · Peso · Unidade de venda (removidos Categoria/Fornecedor).
- **Descrição** com sub-seções (`RichHtmlSection`, HTML **sanitizado no servidor** e passado como string — não dá pra importar `sanitize-html` no client): Descrição · Composição · Aplicação · Conservação · Modo de preparo (só as preenchidas).
- **Documentos inteligentes** (só quando existem, senão a seção some):
  - `components/shared/collapsible-media.tsx` — mede a altura real (`ResizeObserver`); ≤ ~460px mostra inteiro, acima recorta com **fade + "Ver tabela completa"** → modal rolável. Usado por `nutrition-section.tsx`.
  - `technical-sheet-section.tsx` — cartão + modal (lightbox): imagem grande **ou** PDF em `<iframe>`, com "Baixar". Detecta PDF por `.pdf`.
- `catalog-service.getPublicProductBySlug` já retornava tudo (include completo dos scalars novos). `[slug]/page.tsx` monta os dados planos por variação (sanitiza no servidor) e delega ao `ProductDetailView`.

### Painel — estrutura em abas + variação completa (sem parede de campos)

- Novo `components/shared/form-tabs.tsx` — abas com painéis **sempre montados** (`hidden`) para o FormData; salta para a aba com erro após submit (ponto de alerta por aba). `product-form.tsx` reorganizado em **Geral · Especificações · Conteúdo · Variações · Nutrição**.
- `RichTextEditor` agora é **dual-mode** (`name` uncontrolled **ou** `value`/`onChange` controlado) — reusado dentro do JSON dos sabores. Novo `single-document-upload.tsx` (dual-mode, PDF/imagem, pasta `documents`).
- `flavor-form-section.tsx` reescrito: cada variação é um **cartão expansível** (nome, foto, SKU, peso, descrição rich text, ficha técnica, disponível, tabela nutricional).
- Zod (`product-schema`) + `product-service` (create/update/get + cleanup de fichas órfãs) + `product-actions` + páginas novo/`[id]` estendidos com os novos campos.

### Cotação — "Nome / Empresa" (supersede campo "Empresa")

- `quote-form.tsx`: campo `name` relabelado **"Nome / Empresa *"** + placeholder "Digite seu nome ou o nome da empresa."; **removido** o campo "Empresa" separado (coluna `Quote.company` mantida no banco). Mensagem do Zod ajustada.

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Service por script `tsx`** (round-trip, 19 checks): produto + 2 variações completas (SKU/peso/descrição/ficha/tabela/disponível distintos) gravados e lidos (admin + público), toggle indisponível, `composition` limpa no update, limpeza total. Dados de teste removidos.
- **Chrome real** (screenshots reais; o preview interno tem o glitch de composição): reatividade confirmada (clicar variação troca imagem/legenda/tabela), CTA único, "Cód. JOO-001" em destaque, specs sem repetição, **tabela nutricional grande → fade + "Ver tabela completa" → modal rolável**, **ficha técnica → cartão + modal (imagem + Baixar)**, produto sem documentos não deixa vão, breadcrumb completo. Formulário de cotação com "Nome / Empresa" e sem o campo Empresa. Mobile 375px sem overflow (medido `scrollWidth == clientWidth`) no detalhe (com/sem variação) e na listagem. Ficha técnica de teste semeada e **revertida**.
- **Render do form admin** não exercitável no preview (login cross-site) — escrita validada por script, UI por type-check/lint (limitação já registrada).

Pendências que seguem: números de marketing a confirmar; modo escuro; `/contato` (404); produção (domínio/e-mails, Resend com domínio verificado, senha admin, deploy — `migrate deploy` + `generate` + volume `public/uploads` + `client_max_body_size` no Nginx). A ficha técnica (PDF/imagem) e os campos de conteúdo/variação são cadastrados pela cliente no painel (dado, não código).

### Refino de UX/UI da página de detalhe (mesma data, 2ª rodada)

A cliente pediu mais refino sênior. Ajustes só no `product-detail-view.tsx`:

- **Specs enxutas:** removida a linha **"Embalagem"** (duplicava "Unidade de venda"). Ficam **Código (SKU)** + **Peso** (só quando houver) + **Unidade de venda** — cada linha justifica sua presença. `ProductSpecs` já descarta as vazias, então produto sem peso mostra só SKU + Unidade.
- **Seletor de variação = chips de NOME** (supersede as miniaturas): abandonei as miniaturas que competiam com a imagem principal. Agora são **chips de texto** no MESMO estilo dos chips de categoria da listagem (`rounded-full`, ativo `bg-primary`, hover `border-primary/40`), com ✓ (`text-brand`) nos que já estão na cotação e esmaecidos quando indisponíveis. `flex-wrap` (12 sabores quebram em linhas, sem carrossel/setas). Clicar troca imagem/SKU/peso/descrição/tabela/ficha (reativo). O foco visual volta a ser o produto.
- **Descrição | tabela nutricional lado a lado:** o bloco inferior virou grid **`[minmax(0,1fr)_minmax(0,420px)]`** — descrição à esquerda, documentos (tabela nutricional + ficha técnica empilhadas) à direita **quando existem**; **sem documentos, a descrição ocupa a largura de leitura** (`max-w-3xl`). Antes a descrição vinha inteira e só depois a tabela (página muito alta). A tabela mantém o comportamento inteligente (prévia 460px + "Ver tabela completa" → modal).
- **Descrição em seções:** cada bloco preenchido (Descrição/Composição/Aplicação/Conservação/Preparo) é uma seção com título próprio (`RichHtmlSection`), na coluna de leitura mais estreita — some o "paredão" de texto.

Verificado no **Chrome real via JS** (a tela é hi-dpi/zoom 1.5 — screenshots saem pequenos, mas as medidas são conclusivas): produto com variações → 4 chips de nome, specs = SKU + Unidade, grid descrição|documentos, **tabela recortada `scrollHeight 973 → clientHeight 460` + botão "Ver tabela completa" presente**; produto sem variações (`bolo-de-aipim`) → specs = SKU + Unidade (sem Embalagem), sem tabela → descrição full-width, sem chips, **sem overflow**. `type-check` + `lint` + Prettier limpos.

### Seletor de variação → CARROSSEL de miniaturas (mesma data, 3ª rodada — supersede os chips de texto)

A cliente pediu um **carrossel horizontal de variações logo abaixo da imagem principal**, com miniatura da embalagem + nome (padrão de catálogo profissional), não chips de texto nem uma lista solta. `product-detail-view.tsx`:

- Novo `VariationCarousel` (interno) na **coluna esquerda, abaixo da imagem principal** (saiu da coluna de informações). Cada item: **miniatura padronizada** (`w-24`, caixa `aspect-square` branca, `object-contain`) + **nome abaixo** (`line-clamp-2`, `min-h-8` para alinhar). Item ativo destacado (`border-primary bg-accent ring-primary/30`, nome em `text-primary`); ✓ vermelho nos que já estão na cotação; indisponível esmaecido.
- **Setas ◂ ▸** aparecem só no overflow (`canLeft/canRight` via listeners scroll/resize — mesmo padrão de `supplier-section`/`category-filter`); **rolagem horizontal suave** (`scrollBy behavior:smooth`, `snap-x`), scrollbar oculta, altura compacta.
- Clicar é 100% reativo (sem recarregar): troca imagem principal + legenda, "Sabor: X" no cabeçalho, SKU, peso, descrição, tabela nutricional e ficha técnica. CTA único permanece.
- Cabeçalho da direita ganhou a linha **"Sabor: {selecionado}"** (reflete a variação ativa).
- Verificado no **Chrome real**: `bolo-cremoso-5kg` (12 variações) → carrossel abaixo da imagem, miniaturas 96px padronizadas com foto de cada sabor, clicar "Coco" troca imagem/legenda/`Sabor: Coco` (aria-pressed só no ativo), **seta ▸ presente** (overflow), rolagem suave. Mobile 375px **sem overflow** (preview interno). `type-check` + `lint` + Prettier limpos.

### Variações → TIRA VERTICAL ao lado + imagem em RETRATO (mesma data, 4ª rodada — supersede o carrossel horizontal)

Correção após feedback enfático da cliente: os sabores devem ficar **AO LADO** da imagem (não abaixo) e as **fotos na vertical**. `product-detail-view.tsx`:

- `VariationCarousel` (horizontal, abaixo) → **`VariationStrip`**: tira **vertical** de miniaturas ao lado esquerdo da imagem principal (padrão de galeria de grandes distribuidores). Coluna esquerda virou `flex gap-3` = [tira vertical `w-16/w-20`, rolagem vertical, `scrollbar-width:thin`] + [imagem principal `flex-1`]. Miniatura em **retrato** (`aspect-[3/4]`, `object-contain`, sem cortar) + nome abaixo (`text-[10px]`, `line-clamp-2`); ativo destacado (`border-primary bg-accent ring`), ✓ vermelho na cotação, indisponível esmaecido. Removidas as setas/`SCROLL_STEP`/hooks de scroll horizontal (rola na vertical).
- **Imagem principal em retrato**: `VariationImage` de `aspect-square` → **`aspect-[4/5]`** (o pacote vertical preenche a caixa; antes ficava pequeno num quadrado com muita margem).
- Reatividade intacta (clicar troca imagem/SKU/peso/descrição/tabela/ficha + "Sabor: X"). Verificado no **Chrome real** (`bolo-cremoso-5kg`, 12 sabores): tira vertical ao lado com rolagem, imagem em retrato preenchendo, clicar "Coco" move o destaque e troca tudo. Mobile 375px **sem overflow**. `type-check` + `lint` + Prettier limpos.

### Galeria de imagens POR VARIAÇÃO (6ª rodada — seletor de sabor ≠ galeria de fotos)

A cliente esclareceu que são **duas coisas distintas** que eu havia fundido: (A) **seletor de sabores** = botões de texto (só troca a variação); (B) **galeria de imagens** = miniaturas verticais das **fotos da variação selecionada** (frente, verso, embalagem…), onde clicar troca só a imagem principal e trocar de sabor substitui a galeria inteira. Isso exigiu **múltiplas imagens por variação** (antes cada variação tinha um único `imageUrl`).

**Banco — migração `20260728_flavor_image_gallery` (aditiva, com migração de dados):**
- `ProductImage` += `flavorId String?` + relação `flavor ProductFlavor?` (`onDelete: Cascade`) + índice. `flavorId` nulo = galeria do produto; preenchido = galeria daquela variação. A imagem sempre tem `productId` (a de variação carrega os dois). `ProductFlavor.images ProductImage[]`.
- **Migração de dados:** cada `ProductFlavor.imageUrl` virou a 1ª imagem (capa) da galeria da variação via `INSERT ... SELECT` (34 imagens migradas no dev). `ProductFlavor.imageUrl` **mantido no schema** (legado, ignorado) — não-destrutivo.

**Painel:**
- `ImageUpload` agora é **dual-mode** (`name` uncontrolled **ou** `value`/`onChange` controlado). `flavor-form-section`: cada variação ganhou uma **galeria própria** (`ImageUpload` controlado, pasta `flavors`) no lugar da foto única; o JSON do sabor carrega `images: {url,isPrimary}[]`.
- `product-schema`: `productFlavorSchema.images` (array) substitui `imageUrl`. `product-service`: como `ProductImage` exige `productId` (indisponível no create aninhado do sabor), as imagens de variação são criadas **após** o produto/sabores, dentro da mesma `$transaction` (`buildFlavorImageRows` alinha `createdFlavors[i]` ↔ entrada válida `[i]` por ordem) via `createMany`. `getProductById` inclui `flavors.images` e restringe a galeria do produto a `flavorId: null`. Cleanup de arquivos já cobre as imagens de variação (são `ProductImage` com `productId`).

**Público:**
- `catalog-service`: `getPublicProductBySlug` inclui `flavors.images` e a galeria do produto (`images where flavorId null`); `CATALOG_CARD_SELECT` passou a pegar a capa com **fallback** (`take 1 orderBy isPrimary desc` — inclui imagens de variação, já que produtos com variações não têm imagem de nível produto).
- `ProductGallery` **reescrito** para **tira vertical de miniaturas + imagem principal** (clicar na miniatura troca só a principal). No `ProductDetailView` a galeria recebe `key={selected.id}` → **remonta ao trocar de sabor** (volta à 1ª imagem e reflete as fotos da variação); a galeria efetiva é `selected.images` (fallback para as do produto). Removido o `VariationImage`. Os **botões de sabor** (`VariationButtons`) seguem no cabeçalho da coluna de informações — as duas funções ficam claramente separadas.

**Verificação:** `type-check` + `lint` + Prettier limpos. Round-trip por script `tsx` (criar produto com 2 variações e galerias de 2/1 imagens → admin e público retornam as galerias; update removendo imagem → reflete; limpeza). **Chrome real** (`bolo-cremoso-5kg`): botões de sabor no topo; selecionar "Coco" (semeadas 3 imagens de teste, depois revertidas) exibiu a **tira vertical de 3 miniaturas** ao lado; clicar na 2ª miniatura trocou **só a imagem principal**; trocar de sabor substituiu a galeria. Mobile 375px **sem overflow** (12 botões). Dados de teste do dev restaurados.

### Variações → BOTÕES (5ª rodada — decisão final da cliente, supersede a tira/miniaturas)

A cliente reafirmou que quer os sabores como **botões** (não miniaturas). Estado final do seletor: `VariationButtons` — pílulas de texto com o nome do sabor, na **coluna de informações** (à direita, ao lado da imagem), `flex-wrap` (quebram em linhas). Mesmo estilo dos chips de categoria do catálogo: ativo `bg-primary text-primary-foreground`, inativo borda + hover, ✓ vermelho nos que já estão na cotação, esmaecido quando indisponível. Clicar é reativo (imagem/SKU/peso/descrição/tabela/ficha). Removidos `VariationStrip` e a linha "Sabor: X" do cabeçalho (o botão ativo já indica a seleção). A **imagem principal permanece em retrato** (`aspect-[4/5]`). Verificado no Chrome real (`bolo-cremoso-5kg`): 12 botões, clicar "Coco" preenche o botão de azul e troca a imagem principal para o pacote Coco. `type-check` + `lint` + Prettier limpos.

---

## 2026-07-29 — Enriquecimento do cadastro dos produtos (descrição/composição/preparo via web)

A pedido da cliente ("pesquise a descrição na web, e a tabela nutricional se achar"), enriqueci o cadastro dos 19 produtos com dados **reais** pesquisados na web — **sem inventar** (regra da casa). Pesquisa feita por 4 subagentes em paralelo (por fornecedor: Adimix ×3, Fleischmann+Ruby), cada um retornando JSON com descrição/composição/aplicação/conservação/modo de preparo/destaques + URLs de fonte; tabela nutricional só se achasse fonte oficial.

- **Fontes:** sites oficiais Adimix (adimix.com.br), Fleischmann Profissional, Ruby Snacks + distribuidores (Ameripan etc.).
- **Aplicado a 18 de 19 produtos.** "Chocolisse Cobertura" ficou **intacto** (nenhuma fonte confiável — não substituí por produto parecido).
- **Nenhuma tabela nutricional criada:** nenhum dos produtos tinha tabela ANVISA oficial publicada (Adimix/Fleischmann publicam receita/ingredientes, não a tabela; a da Ruby está embutida em imagem, não extraível). Ficaram sem tabela — a cliente preenche pela embalagem no painel.
- **Preservação de dados:** o script (`scratchpad/apply-product-content.mts`) só sobrescreve a **descrição** quando a atual é curta/placeholder (< 400 chars de texto); descrições longas já reais (Ruby, MIX Croissant, Pão de Queijo, AdiMix Super) foram **mantidas**, recebendo apenas os campos estruturados novos (composição/aplicação/conservação/preparo/destaques). Cada campo só é escrito quando a pesquisa trouxe valor real; o resto é preservado. **Backup** das descrições anteriores em `scratchpad/products-content-backup.json`.
- Verificado: a página de detalhe (ex.: `bolo-de-aipim-5kg`) passou a exibir as 5 seções organizadas (Descrição · Composição · Modo de aplicação · Conservação · Modo de preparo) + benefícios (✓). Escrita direta no banco (dev) — a cliente revisa/ajusta pelo painel.

Observação: os textos vieram de fontes públicas e são factuais, mas **a cliente deve revisar** (algumas proporções/validades variam por lote/SKU; o agente sinalizou incertezas de SKU em Pão de Batata, Pão Francês Integral e Creme Chantilly Choc). Nada de valor nutricional foi inventado.

### Barrinha Ruby — descrição reorganizada + descrição por variação (mesma data)

- **Produto (Barra de Proteína - Ruby):** o "blocão" antigo (peso, conservação, embalagem, ingredientes, alérgicos, recomendação num campo só) foi reorganizado em seções: **description** (intro curta/vendedora), **composition** (ingredientes + alérgicos + nota "pode variar conforme o sabor"), **conservation** (armazenamento + peso líquido 40 g + recomendação de uso). Infos de logística (embalagem primária/secundária/terciária) removidas. `shortDescription` preenchida.
- **Variações:** cada um dos 4 sabores (Bolo de Cenoura com Chocolate, Pão de Mel com Doce de Leite, Doce de Leite com Amendoim, Brigadeiro Belga) ganhou **`ProductFlavor.description` própria** (texto do sabor, factual — sem inventar nutrição). Aparecem no painel (Variações → Descrição da variação) e no site ao selecionar o sabor; a descrição geral do produto vira fallback. Escrita direta no banco (dev), via script.

---

## 2026-07-29 (tarde) — Revisão final da área de Produtos (catálogo + detalhe + painel) contra especificação

Revisão completa pedida pela cliente como entrega definitiva (documento de especificação, não sugestões). Diagnóstico crítico feito antes de mexer: mapeei o código real de catálogo, detalhe, admin/schema e o padrão de referência (Home/Sobre) por 4 agentes em paralelo. Grande parte já estava conforme (sabores = chips de texto, galeria vertical, botão único vermelho, schema/admin cobrindo todos os campos, cotação já com "Nome / Empresa"). As divergências eram pontuais e foram TODAS corrigidas numa só rodada:

### Catálogo (`app/(public)/produtos/page.tsx` + `features/catalog/components/`)

- **Hero** refeito no padrão Home/Sobre: base `#0e2c62` + gradiente da marca (`#0e2c62→#17479e→#2159bd`) + acento vermelho radial, **altura fixa `min-h-[340px]`**, conteúdo centralizado (`flex items-center`), container `max-w-7xl px-6` (24px), **apenas título ("Produtos." com ponto vermelho) + subtítulo** (removida a barra de acento extra). Navbar transparente por cima (rota já em `HERO_ROUTES`; verificado header `rgba(0,0,0,0)` + logo branco no topo).
- **Caixa de filtros SOBREPOSTA ao hero**: o painel saiu da `<section>` de baixo para um wrapper `relative z-20 -mt-[70px]` (invade a base do hero — verificado overlap = 70px). Aparência: `rounded-[20px]`, `p-6/sm:p-8` (32px), sombra suave (`shadow-[0_18px_50px_-28px_rgba(14,44,98,0.3)]`).
- **Campo de busca** (`catalog-search-field`): `h-11 rounded-full` → **`h-12` (48px) `rounded-[12px]`** (o `rounded-xl` do tema resolve 16px; usei valor literal p/ os 12px exatos). Transição `duration-200`.
- **Filtros de categoria e fornecedor com estados unificados** (`category-filter` + `supplier-section`): antes divergiam (categoria = preenchimento sólido; fornecedor = só anel; ambos sem foco). Agora **os mesmos 4 estados**: normal `border-border`; hover `border-primary/40 bg-accent`; **ativo `border-primary bg-accent text-primary ring-1 ring-primary/40 shadow-sm`**; foco `focus-visible:ring-2 ring-primary/50`; transição `transition-colors duration-200`. (O seletor de SABOR na página de detalhe segue com preenchimento azul sólido de propósito — é outro contexto, "no que estou vendo", não o filtro do catálogo.)
- **Cards** (`product-card`): título ganhou `line-clamp-2 min-h-[2.75rem]` (altura do bloco de texto uniforme). Imagem já era `aspect-square object-contain` (uniforme) e botão já no rodapé (`flex h-full flex-col` + `Link flex-1`).

### Página de detalhe (`features/catalog/components/product-detail-view.tsx`)

- **Ordem da coluna direita** corrigida para a sequência exata: **Título → Fornecedor → SKU → Sabores → Quantidade → Botão → Especificações** (antes fornecedor/SKU vinham ANTES do título). `shortDescription` fica como lead sob o título; **Benefícios** movidos para o fim da coluna (após Especificações).
- **Especificações**: adicionada **Embalagem** (`product.packaging`, exibida só quando preenchida) — antes só SKU/Peso/Unidade. Segue sem repetir fornecedor/categoria (já no cabeçalho/breadcrumb).
- **Ordem das seções de descrição** corrigida para **Descrição → Composição → Modo de preparo → Conservação → Modo de aplicação** (antes Aplicação e Preparo estavam trocados). Espaçamento entre seções `space-y-8` (32px), `.rich-content` line-height 1.7.
- **Grid descrição/tabela** `[1fr_420px]` → **`[minmax(0,65fr)_minmax(0,35fr)]`** (65/35 explícito). Sem documentos, a descrição ocupa a largura de leitura (`max-w-3xl`).
- **Modal de conteúdo grande** (`components/shared/collapsible-media.tsx`): limiar `maxHeight` 460 → **450px**. Ficha técnica/PDF seguem em modal por clique.
- Docstrings/comentários desatualizados (falavam em "retrato"/"tira de variações") corrigidos.

### Painel — ordem das variações (`features/product/components/flavor-form-section.tsx`)

- Adicionadas **setas ↑ ↓ por variação** para reordenar (a posição no array define `ProductFlavor.order`, já persistido por índice no service). Antes não havia UI de ordem. Botões desabilitam nas pontas. Demais campos de produto/variação já existiam ponta a ponta (schema/Zod/form/service) — nada a acrescentar (`packaging`, `order`, `shortDescription`, composição/aplicação/conservação/preparo, benefícios, ficha técnica, galeria por variação, tabela por variação, relacionados, status).

### Cotação

- Requisito "Empresa → Nome / Empresa" + placeholder **já estava implementado** (`quote-form.tsx`: label "Nome / Empresa *", placeholder "Digite seu nome ou o nome da empresa."; sem campo Empresa separado). Nada a mudar. (Obs.: `quoteSchema.company` opcional segue como resíduo inerte — limpeza futura.)

### Verificação

- `type-check` + `lint` + Prettier limpos.
- **Chrome real** (o preview embutido não compõe frames — glitch registrado): catálogo com hero 340px, header transparente + logo branco, caixa branca sobreposta (overlap 70px, radius 20/padding 32), busca 48px/12px, chips ativos no estado unificado (bg accent + borda primária), cards uniformes (line-clamp 2). Detalhe (Barra de Proteína Ruby, com sabores): header sólido, breadcrumb, ordem da coluna direita exata, Embalagem nas specs, botão único vermelho, descrição | tabela nutricional lado a lado (65/35). Produto sem variações/documentos (Bolo de Aipim): 5 seções na ordem correta, descrição em largura de leitura sem coluna vazia. Sem erros de console. Mobile 375px sem overflow horizontal nas duas telas.
- Render do form admin (setas de ordenação) não exercitável no preview (login cross-site) — validado por type-check/lint; a lógica só reordena o array em memória.

### Ajustes finais da revisão (mesma data)

- **Specs do detalhe:** removida a linha **"Embalagem"** (`product-detail-view.tsx`) — ficam só **SKU (quando houver), Peso (quando houver) e Unidade de venda**. Interface mais limpa (pedido da cliente; supersede a adição de Embalagem feita horas antes nesta mesma revisão).
- **Hero do catálogo:** removido o **ponto final vermelho** do título — agora só "Produtos" (sem `<span className="text-brand">.</span>`).
- **Galeria vertical (diagnóstico):** a tira vertical de miniaturas **não tinha bug** — está implementada e funciona (verificado no Chrome real com a variação "Coco" do Bolo Cremoso, que tem 4 imagens: aparecem 4 miniaturas, clicar troca só a imagem principal, trocar de sabor troca a tira inteira). O motivo de "não aparecer" é de **dados**: quase todos os produtos do dev têm **1 imagem** cada (só "Coco" tem 4), e a tira, por design, só surge com **2+ imagens** (uma miniatura única duplicando a imagem grande ficaria redundante — padrão de mercado). **Ação para a cliente:** subir mais fotos por produto/variação no painel (Geral → galeria, ou Variações → galeria da variação) para a tira aparecer nos demais. Nenhuma mudança de código na galeria (o gate `images.length > 1` foi mantido de propósito).

- **Galeria vertical — sempre visível (decisão da cliente, supersede o gate `> 1`):** a cliente reforçou que a tira precisa aparecer sempre. Gate alterado de `images.length > 1` para **`>= 1`** em `product-gallery.tsx` — a tira de miniaturas é exibida com qualquer quantidade de imagens (com 1 foto, mostra 1 miniatura). Verificado no Chrome real: Bolo de Aipim (1 imagem) agora mostra a tira; Bolo Cremoso "Coco" (4 imagens) mostra as 4 sincronizadas com a principal e com a variação. `type-check`/`lint`/Prettier limpos.

### Galeria vertical reformulada — agregada por variação (supersede as notas de galeria anteriores)

Comportamento definitivo pedido pela cliente (a galeria não depende mais do sabor previamente selecionado):

- **Produto SEM variações** → **sem tira vertical**, apenas a imagem principal (layout limpo, sem espaço vazio).
- **Produto COM variações** → tira vertical exibida **desde o carregamento**, contendo **TODAS as imagens de TODAS as variações** (agregadas, cada miniatura marcada com seu `flavorId`).
- **Clique em qualquer miniatura** → identifica o sabor daquela imagem, **seleciona o sabor** e sincroniza toda a interface (imagem principal, SKU, descrição, tabela nutricional, ficha técnica, disponibilidade…).

Implementação:
- `product-gallery.tsx` virou **componente controlado**: props `mainImage`, `thumbnails` (vazio = sem tira), `activeUrl`, `onSelect`. Não tem mais estado interno nem gate por `images.length`. Uma imagem de placeholder aparece só se não houver nem principal nem miniaturas.
- `product-detail-view.tsx`: novo `variationThumbnails = variations.flatMap(v => v.images.map(img => ({...img, flavorId: v.id, flavorName: v.name})))` (via `useMemo`); estado `activeImageUrl` (inicia na 1ª imagem do sabor inicial); `selectFlavor(id)` (botão de sabor → leva a principal p/ a 1ª imagem do sabor) e `selectThumbnail(img)` (miniatura → `setActiveImageUrl(img.url)` + `setSelectedId(img.flavorId)`). `mainImage` = miniatura cuja url == `activeImageUrl` (com variações) ou `product.images[0]` (sem variações). Removidos o `galleryImages`/`galleryCover` e o `key` de remount; a galeria agora é dirigida pelo estado, não remontada. `VariationButtons.onSelect` → `selectFlavor`; imagem do carrinho = `mainImage.url`.

Verificado (Chrome real + preview interno): Bolo Cremoso (12 variações, 15 imagens no total) → tira com 15 miniaturas desde o load, ordem agregada (Aipim, Banana, Coco×4, …), Aipim ativo por padrão; clicar numa miniatura do Coco seleciona o sabor Coco (botão + miniatura ativos). Bolo de Aipim (sem variações) → 0 miniaturas, só a imagem principal, sem tira. `type-check` + `lint` + Prettier limpos.

---

## 2026-07-29 (noite) — Auditoria de pré-produção do painel administrativo

Auditoria ampla (funcional, performance, UX/DS, validação, limpeza, consistência site↔painel, estabilidade) feita por 4 agentes em paralelo + checks próprios (type-check/lint/build). Base já estava sólida (validação server-side sem caminho de "dado inválido salvável", transações atômicas, guards + rate limit, guardas de exclusão). Correções aplicadas:

### Corretude / estabilidade
- **Subcategoria não é mais promovida a raiz ao editar** (`category-service.updateCategory`): removido `parentId: input.parentId ?? null` do update — o vínculo pai é definido só na criação (`createSubcategory`); o `CategoryForm` não reparenteia. Antes, abrir `/admin/categorias/<sub-id>` e salvar zerava o `parentId` (perda de hierarquia silenciosa).
- **Sitemap sem 404** (`app/sitemap.ts`): removidas as URLs `/receitas` e `/contato` (páginas inexistentes). Agora async: rotas estáticas reais + `/nossas-unidades` + **URLs dinâmicas dos produtos ativos** (lidas do banco; try/catch mantém as estáticas se o banco falhar).
- **Rotas órfãs removidas** de `constants/site.ts` (`categoryDetail`, `recipes`, `recipeDetail`, `contact`, `admin.recipes`) — sem nenhum uso (grep confirmou); alimentavam o sitemap 404.

### Consistência painel↔site (staleness — P1 resolvido)
- Novo `lib/revalidate-catalog.ts` → `revalidatePublicCatalog()` (revalida `/`, `/categorias`, `/produtos`, `/produtos/[slug]`). Ligado em **todas** as mutations de produto/categoria/subcategoria/fornecedor (antes só revalidavam `/admin/*`). Home ("Compre por segmento" + carrossel de fornecedores) e `/categorias` são estáticas (ISR) e ficavam até 1h desatualizadas após salvar — agora refletem na hora. (Settings já fazia via `revalidateTag`.)

### Performance
- **`getPublicProductBySlug` em `React.cache`** (`catalog-service.ts`): a página de detalhe a chamava 2× por request (generateMetadata + corpo) — a query mais pesada do site. Agora 1× por request.
- **Paginação server-side no painel** (antes carregavam TODOS os registros — pior caso: cotações, que só acumulam):
  - `listProducts` reescrito com `skip/take` + busca (nome/SKU) + filtro de status; a página `/admin/produtos` ganhou barra de filtros (form GET) + `AdminPagination`. 20/página.
  - `listQuotes` reescrito paginado (mantém filtro por status); `/admin/cotacoes` com `AdminPagination`. 20/página.
  - Novo `components/shared/admin-pagination.tsx` (paginador compacto Anterior/Próxima).
- **Upload com rate limit** (`app/api/admin/upload/route.ts`): `consumeRateLimit("upload:<ip>", 40/60s)` — antes só exigia sessão; agora contém rajada que encheria o disco da VPS.

### UX / Design System (painel "parece o mesmo sistema")
- **`font-display` (Archivo) nos 16 títulos** de página do admin (antes o painel nunca usava a fonte de títulos do site).
- **Campos padronizados:** `Input` → `h-10` + foco `ring-2 ring-offset-2` + `aria-invalid:border-destructive` (antes `h-9`/`ring-1`). Novo `components/ui/native-select.ts` (`nativeSelectClass`) unifica os `<select>` nativos (havia 3 estilos: h-9/h-10, foco divergente) — aplicado em product-form, user-form, quote-detail-manager, related-products-field. **Checkboxes** (8) ganharam `accent-primary` (cor da marca no marcado) + anel de foco.
- **Skeletons de carregamento** (antes inexistentes): `components/shared/admin-skeletons.tsx` + `loading.tsx` nas rotas admin (produtos, categorias, fornecedores, usuarios, cotacoes = tabela; dashboard = cards).
- **Tabela nutricional responsiva** (`nutrition-fields.tsx`): grid de colunas fixas agora em `overflow-x-auto` + `min-w-[34rem]` (antes espremia/estourava em ~360px).
- **`TAB_FIELDS.especificacoes` inclui `status`** (a aba não acendia o alerta de erro quando o status era inválido).

### Verificação
- `type-check` + `lint` + Prettier limpos; **build de produção passa sem warnings** (nem hidratação). 
- **Chrome real** (login `admin@miraf.com.br`): `/admin/produtos` com título em font-display, barra de filtros e tabela; `?q=bolo&status=ACTIVE` filtra para 2 produtos + link "Limpar"; sem erros de console. `sitemap.xml` sem `/receitas`//`contato`, com `/nossas-unidades` + 19 URLs de produto.

### Recomendações registradas (não aplicadas nesta rodada — menor risco/valor ou operacional)
- **Uploads órfãos no disco:** arquivos enviados mas cujo produto não foi salvo ficam em `public/uploads` sem referência. Recomendado um job periódico de varredura (reusando `isUploadPathInUse`). Operacional (VPS).
- **Cleanup em lote:** `isUploadPathInUse` roda 6 `count` por arquivo (N+1 no save de galerias grandes) — dá para agrupar em 1 query por tabela com `url: { in: [...] }`. Só afeta o save no admin (raro).
- **Editor rich text (TipTap):** `/admin/produtos/[novo|id]` ~260 kB (admin-only). Lazy-load possível, mas o hidden input do modo não-controlado tem timing sensível no submit — deixado como está.
- Client de upload poderia estreitar `accept` (hoje `image/*`) e checar tamanho antes de enviar (hoje só o servidor rejeita); toasts de sucesso unificados; magic-bytes no upload. Colunas inertes conhecidas seguem (metaTitle/metaDescription auto-SEO, ProductFlavor.imageUrl, Category.bannerUrl, Quote.company, ProductImage.alt, NutritionFacts.footnote).

### Correção — miniatura ativa marcada em duplicidade (galeria)

Bug: com variações que **reusam a mesma imagem**, ao selecionar um sabor **duas (ou mais) miniaturas** ficavam com o anel de ativo. Causa: o destaque comparava `image.url === activeUrl` — como várias variações apontam para o mesmo arquivo, o match acertava todas. Correção: a galeria passou a rastrear a miniatura ativa por **índice** na lista achatada (`activeIndex`), que é único por miniatura, em vez da URL. `ProductGallery` recebe `activeIndex` + `onSelect(index)`; `product-detail-view` guarda `activeIndex` (inicial = 1ª miniatura do sabor inicial), `selectFlavor` salta para o índice da 1ª imagem do sabor e `selectThumbnail(index)` seleciona o sabor daquela miniatura. Verificado no Chrome real: exatamente **1** miniatura ativa no load e ao trocar de sabor (Aipim/Banana/Coco). `type-check` + `lint` + Prettier limpos.

---

## 2026-07-29 (UI polish) — Página de detalhe do produto + fix do CTA "Ver minha cotação" + filtros em linha única + polish do catálogo

Rodada de acabamento (UI polish) a pedido da cliente, em duas telas públicas — **detalhe do produto** e **listagem do catálogo** — mais dois bugs corrigidos no caminho. Sem mudança de schema/DB, fluxo, identidade ou paleta; só refinamento visual/UX.

### Fundação — sistema de elevação + utilitário de scrollbar (`app/globals.css`)

- **`.shadow-soft` / `.shadow-soft-md`** (novos, em `@layer components`): sombras suaves via `color-mix` sobre `--foreground` (funcionam em claro/escuro), para percepção de camadas sem peso. Usadas de forma consistente nas duas telas (cards, galeria, specs, tabela nutricional, ficha técnica, fornecedores).
- **`.no-scrollbar`** (novo, **NÃO-layered** de propósito): oculta a barra de rolagem dos carrosséis de linha única. **Gotcha importante registrado:** a regra global de scrollbar (`* { scrollbar-width: thin }` + `*::-webkit-scrollbar{…}`, adicionada em 2026-07-25) é **não-layered**, e no Tailwind v4 os utilitários vivem em `@layer utilities` — **CSS não-layered vence layers no cascade**, então `[scrollbar-width:none]`/`[&::-webkit-scrollbar]:hidden` (utilitários) **perdiam** para a regra global e a scrollbar de 10px aparecia. A classe `.no-scrollbar` não-layered vence por especificidade no mesmo nível. Aplicada nos scrollers de categoria/subcategoria e de fornecedores.

### UI polish — página de detalhe do produto

`features/catalog/components/{product-detail-view,product-gallery,product-detail-parts,rich-html-section,nutrition-section,technical-sheet-section}.tsx`, `features/nutrition/components/nutrition-table.tsx`, `components/shared/{quantity-stepper,collapsible-media}.tsx`, `app/(public)/produtos/[slug]/page.tsx`.

- **Galeria:** imagem com mais destaque (padding `p-6`→`p-4/5`), card com borda + `shadow-soft` (hover `shadow-soft-md`), **zoom sutil no hover** (desktop), **fade ao trocar de imagem** (`animate-in fade-in-0`), **lightbox em tela cheia** ao clicar (Dialog, com miniaturas). Miniaturas com hover/selected mais evidentes, `shadow-soft`, `loading="lazy"`.
- **Seletor de sabor:** maior (altura 44px/`min-h-11`, mais padding), `active:scale`, transições suaves; ativo já preenchido em azul.
- **Quantidade:** `QuantityStepper` ganhou `size="lg"` — "casca" arredondada unificada (`rounded-full`), botões maiores (`size-12`) com feedback (`active:scale-90`, hover azul), alinhado ao CTA (h-12).
- **CTA vermelho** "Adicionar à cotação": hover com elevação + sombra vermelha, `active` (pressed), `transition-all`. Cor da marca intacta.
- **SKU / Peso / Unidade** viraram **information cards** (rótulo em maiúsculas + valor em destaque, `flex-1` para preencher a linha, `shadow-soft`).
- **Benefícios** viraram **feature cards** (grade 2 col, ícone em "pílula" azul, hover).
- **Descrição:** cada bloco (Descrição/Composição/Preparo/Conservação/Aplicação) ganhou **marcador de acento** azul no título (`RichHtmlSection`) → escaneabilidade. Mesmo marcador aplicado aos títulos de "Tabela nutricional" e "Ficha técnica" (consistência).
- **Tabela nutricional:** card com `shadow-soft`, e **destaque sutil de Valor Energético e Proteínas** (casado por substring do rótulo — "energ"/"prote"; não-destrutivo, degrada se o rótulo for customizado). Botão **"Ver tabela completa"** mais evidente (outline azul da marca).
- **Equilíbrio de colunas:** descrição | documentos de 65/35 → **58/42**, gaps menores; **espaço hero→descrição reduzido** (`space-y-14`→`space-y-10`, `pt-10`→`pt-8`) para dar continuidade de leitura.
- **Breadcrumb** mais legível (peso, contraste, hover azul).
- Verificado no **Chrome real** (o preview embutido não compõe frames — glitch já registrado): desktop (2-col) e tablet (819px, 1-col) sem overflow (varredura = 0 offenders); produto sem variações/documentos com layout correto; **troca de sabor reativa + fade + lightbox** funcionando; sem erros de console. Mobile 375px não renderizável no Chrome real (o display cai em ~1080/819) — validado por análise estrutural + o passe do tablet.

### Fix — botão "Ver minha cotação" ficava azul (detalhe do produto)

- Quando o sabor selecionado já estava na cotação, o CTA vermelho dava lugar a "Ver minha cotação" (`variant="outline"`), cujo hover padrão é `hover:bg-accent`/`hover:text-accent-foreground` — **ambos são o azul da marca** — e eu ainda tinha reforçado com `hover:text-primary`/`hover:border-primary/50`. Como o botão só aparece nos sabores já adicionados, dava a impressão de "depende do sabor fica azul".
- **Correção** (`product-detail-view.tsx`): secundário **neutro** — `border-border text-foreground hover:bg-muted hover:text-foreground` (o `tailwind-merge` do `cn` faz o hover neutro vencer o do variant). Verificado no Chrome real: botão cinza-neutro em qualquer sabor, sem azul, ao lado do CTA vermelho e da confirmação verde "Na sua cotação".
- **Observação registrada (não é bug de código):** um item adicionado ao carrinho deixou de ser reconhecido (`isInCart` falso) após reload porque os `productId`/`flavorId` no `localStorage` não batiam mais com os da página — sinal de que o **dev foi reseedado** (IDs mudaram). Após limpar o carrinho e re-adicionar, funcionou. Fica a nota de robustez futura: o carrinho casa por ID do banco; se um produto/sabor for recriado (novo ID), itens antigos somem silenciosamente da tela — dá para sanear o carrinho contra o catálogo (casar também por slug) se virar problema.

### Ajuste — filtros de categoria quebrando linha (catálogo)

- Os chips de **Categorias** usavam `flex-wrap`; com o rótulo longo ("Padaria, Salgados e negócios de alimentação"), "Panificação" caía sozinha na 2ª linha com um vazio grande.
- **Correção** (`features/catalog/components/category-filter.tsx`): a linha de categorias virou um **carrossel horizontal de linha única** com setas ◂ ▸ (mesmo padrão dos fornecedores/subcategorias). Extraí um **`ChipScroller`** reutilizável, usado tanto pela linha de **categorias** quanto pela de **subcategorias** (DRY; `revalidateKey` recalcula as setas quando o conteúdo muda). Scrollbar oculta via `.no-scrollbar`.
- Verificado no Chrome real: categorias em **linha única, sem quebra e sem scrollbar visível**; rola até "Panificação" (`scrollLeft` chega ao máximo); a seta chama `scrollBy({behavior:'smooth'})` corretamente (o não-mover no teste é o CDP anulando animação suave — funciona no browser real; drag/trackpad também rolam).

### UI polish — página de listagem do catálogo (`/produtos`)

`app/(public)/produtos/page.tsx`, `features/catalog/components/{catalog-filter-panel,catalog-search-field,catalog-sort,category-filter,supplier-section,product-card,card-add-to-quote-button}.tsx`.

- **Hero:** hierarquia do título (`leading` mais firme), equilíbrio título/descrição, subtítulo mais legível (`text-white/85` + `text-pretty`). Estrutura preservada (banner definitivo ainda virá).
- **Card de filtros:** altura reduzida ~330px → **286px (~13-15%)** — padding `p-8`→`p-6`, `space-y-6`→`space-y-4`, ritmo vertical mais enxuto.
- **Busca:** hover (`border-primary/40`), focus refinado, **ícone que acende no foco**, placeholder mais legível, `shadow-sm` + transição; altura h-11.
- **Chips de categoria:** hover com sombra sutil + `active:scale`, `transition-all`.
- **Fornecedores:** agora **parecem clicáveis** — hover com **elevação + `shadow-soft`**, selecionado com `shadow-soft`; altura h-16→h-14; scrollbar oculta via `.no-scrollbar`.
- **Counter:** "**19** produtos encontrados" com número `font-bold text-base` e maior contraste.
- **Sort:** altura h-9→h-10, hover de borda, `rounded-lg`, `cursor-pointer`, sombra sutil.
- **Product cards:** `shadow-soft` em repouso → `shadow-soft-md` no hover, `hover:-translate-y-1` + borda destacada + **zoom da imagem** (`scale-1.08`); **imagem +~10% de área** (`p-5`→`p-4`); grid gap `gap-4`→`gap-5`.
- **CTAs unificados** (`card-add-to-quote-button.tsx`): "Adicionar à cotação" e "Escolher sabor" agora têm **a mesma qualidade visual** (outline vermelho da marca, hover preenchido, `active:scale`, `transition-all`).
- **Paginação:** microinterações consistentes (`active:scale`, hover azul, `shadow-soft` no ativo).
- Verificado no Chrome real: **alturas de card idênticas por linha** (392px nos 4 cards de cada linha → botões alinhados), **zero overflow** (1080px), card de filtros 286px, busca 44px, imagem padding 16px, fornecedor 56px; sem erros de console. `type-check` + `lint` + Prettier limpos em toda a rodada.

Pendências inalteradas (produção: domínio/e-mails, Resend com domínio verificado, senha admin, deploy; conteúdo: números de marketing, modo escuro, `/contato` 404). Nota: o **banner definitivo do hero do catálogo** ainda será desenvolvido — a estrutura atual está preparada para recebê-lo.

---

## 2026-08-03 — Banner definitivo no hero da página de produtos

Supersede a pendência "banner definitivo do hero do catálogo". A cliente forneceu a arte; entrou como fundo do hero de `/produtos` (`app/(public)/produtos/page.tsx`). Commitado e no ar (commit `f93de97`, push para `origin/main` → deploy automático no Vercel). Só a página + o asset; nenhuma mudança de schema/DB.

### Decisão-chave (geometria do hero de largura total)

A cliente está numa tela de **2560px** (medido no navegador real). Um hero de **largura total + altura baixa (~440px)** vira uma faixa de proporção **~5,8:1**; com `object-cover`, qualquer imagem "mais quadrada" **é obrigada a cortar** topo/base, e ao ser esticada além da resolução **borra**. Iteramos até chegar na solução correta:

- **A arte tem que ter a proporção da faixa.** A versão final é **6:1** (a cliente gerou depois de eu especificar ~7:2/6:1). Com 6:1, o `object-cover object-center` preenche **de ponta a ponta praticamente sem cortar** (só uns pixels de fundo azul nas bordas laterais) — os insumos ficam inteiros.
- **Fundo azul em largura total** (via `bg`/style no `<section>`, mesmo tom da arte) é obrigatório para o **menu transparente** funcionar sobre o hero (rota já em `HERO_ROUTES`). Não dá para conter a imagem numa `max-w` centrada, senão a navbar transparente fica sobre fundo branco nas laterais (logo/links brancos somem).
- **Altura fixa** `h-[340px] sm:h-[400px] lg:h-[440px]` (a cliente quis compacto, "não muito grande").
- **Nitidez:** o `next/image` estava servindo uma variante menor (~2048px) e o navegador esticava para ~2640px → borrado. Solução: **`unoptimized`** no `<Image>` — serve o arquivo cru em resolução cheia (o navegador então **reduz** para exibir = nítido). Confirmado: `naturalWidth` 3000 exibido a ~2550px (downscale). No mobile o `object-position` puxa os insumos e um scrim azul mantém o texto legível.

### Asset

- **`public/images/hero/produtos.png`** (versionado, **não** gitignorado; não está no `.vercelignore`). Arte 6:1, ~3000×500. **PNG sem perdas** (evita banding no degradê azul + artefato de JPEG nos produtos) com leve realce de nitidez (`sharp`).
- **⚠️ Teto de qualidade = resolução da fonte.** A arte 6:1 original da cliente tinha só **2496px** de largura (≈1:1 numa tela de 2560px → IA nesse tamanho tende a ficar "macia"). Para nitidez máxima, o ideal é a **mesma arte 6:1 exportada maior (~3840×640)**; é só substituir `public/images/hero/produtos.png` (mesma proporção) — nenhuma mudança de código. Registrado como melhoria opcional.

### Padrão registrado (para heros de largura total)

Imagem de fundo full-bleed **só fica sem corte** se sua proporção ≈ a da faixa (largura/altura do hero). Para altura baixa em telas largas isso exige uma arte **ultra-panorâmica** (6:1). Quando a arte é mais "quadrada", ou se aceita corte (`object-cover` + `object-position` em margens seguras), ou se mostra inteira encaixada (`object-contain` sobre fundo de cor, com letterbox). Para nitidez em telas grandes: fonte com largura ≥ a da tela e, se o `next/image` sub-dimensionar, `unoptimized` para servir em resolução cheia.

### Verificação

- **Chrome real (2560px):** banner edge-to-edge, insumos inteiros (nada cortado), nítido (zoom confirma degradê liso + produtos crispados), altura 440px, menu transparente por cima, sem overflow. Mobile sem overflow. `type-check` + `lint` + Prettier limpos.
- Processo: o **preview embutido** teve frames de composição velhos várias vezes nesta sessão (forçar repaint com scroll resolvia); o **Chrome real** foi o que confirmou o resultado. Glitch já registrado em memória.

### Atualização (mesma data) — arte trocada por cena escura (navy)

A cliente iterou a arte várias vezes e a **versão final é uma cena escura em navy** (bancada azul-escura com ingredientes espalhados por toda a largura — ovos, farinha, cacau, canela, cranberries), ainda **6:1** (`produtos.png` atual = 3200×534). Ajustes decorrentes em `app/(public)/produtos/page.tsx`:

- **Fundo/scrim passaram para navy escuro `#040a24`** (antes o azul claro da marca `#01256f`), casando com a cena.
- Como a arte **não tem área limpa à esquerda** (há ingredientes por toda a largura), o **scrim da esquerda escurece um pouco** para dar leitura ao título/subtítulo (`rgba(4,10,36,…)`), fadeando antes do centro; a cliente pediu para **deixar menos azul à esquerda**, então o scrim ficou numa redução leve (0.85→0 até ~64%). `text-shadow` navy no subtítulo em todos os tamanhos.
- **Qualidade — limite atingido:** a fonte da cliente tem só ~2491px (≈1:1 na tela dela de 2560px). Faço upscale (Lanczos)+realce+PNG sem perdas e sirvo `unoptimized` (resolução cheia), mas **não dá para criar detalhe que não existe** — sem super-resolução por IA aqui. **Pendência real:** a cliente exportar a mesma arte em ~**3840×640** para nitidez máxima; aí é só trocar o arquivo (mesma proporção), sem mudança de código. ⚠️ Lição recorrente desta sessão: **não apagar (`rm`) o arquivo-fonte pristino** ao instalar — perdi as versões originais e fiquei só com cópias já processadas.
