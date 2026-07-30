# Graph Report - C:\Projeto\miraf-web  (2026-07-09)

## Corpus Check
- Corpus is ~46,230 words - fits in a single context window. You may not need a graph.

## Summary
- 759 nodes · 1600 edges · 46 communities (33 shown, 13 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Admin: Usuários & Login
- Páginas de Listagem (Admin)
- Páginas: Config. & Detalhe de Cotação
- Páginas: Categorias (CRUD)
- Páginas: Fornecedores (CRUD)
- Componentes de Navegação
- Gestão de Cotações (Admin)
- Páginas Públicas (Home/Produtos)
- Dependências (npm)
- Dashboard (Widgets)
- Config. do Projeto (package.json)
- Config. TypeScript
- Layout do Painel Admin
- Config. shadcn/ui
- Upload de Imagens (API)
- Deploy & Armazenamento (docs)
- Visão Geral do Projeto (docs)
- Padrões de Feature (docs)
- Autenticação (Auth.js)
- Modelos de Dados (docs)
- Config. Prettier
- Fornecedores & Menus (docs)
- Feature Usuários
- Infra Prisma & Settings
- Schema de Configurações
- Componentes do Dashboard
- Config. ESLint
- Tipos next-auth (JWT/Session)
- Identidade Visual (Logo Mira)
- Regras de Arquitetura (docs)
- Config. Next.js
- Config. PostCSS
- Handlers de Rota
- Scaffold Inicial
- Next.js (Framework)
- Ícone (asset)
- Ícone Globe (asset)
- Logo Next.js (asset)
- Logo Vercel (asset)
- Ícone Window (asset)
- Arquitetura do Projeto (doc)
- Visão Geral Miraf (doc)

## God Nodes (most connected - your core abstractions)
1. `ROUTES` - 52 edges
2. `cn()` - 33 edges
3. `Button` - 30 edges
4. `actionError()` - 26 edges
5. `ActionResult` - 24 edges
6. `compilerOptions` - 23 edges
7. `actionFromZodError()` - 21 edges
8. `actionSuccess()` - 18 edges
9. `scripts` - 17 edges
10. `onlyDigits()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Tabela de Stack (Next.js 15, React 19, Tailwind v4, Prisma, PostgreSQL 16, Auth.js v5, Zod, Cloudinary, Resend, Docker)` --semantically_similar_to--> `Stack tecnológica (Next.js 15, React 19, Prisma, PostgreSQL)`  [INFERRED] [semantically similar]
  README.md → CLAUDE.md
- `Regras das features (componentes reutilizáveis fora daqui; services detêm lógica/Prisma; actions só orquestram)` --semantically_similar_to--> `Regras de arquitetura (Server Components por padrão; Action valida com Zod → service → ActionResult; services únicos a acessar Prisma; zero any)`  [INFERRED] [semantically similar]
  features/README.md → README.md
- `DeleteButtonProps` --references--> `ActionResult`  [EXTRACTED]
  components/shared/delete-button.tsx → types/action.ts
- `CategoryFormProps` --references--> `ActionResult`  [EXTRACTED]
  features/category/components/category-form.tsx → types/action.ts
- `ProductFormProps` --references--> `ActionResult`  [EXTRACTED]
  features/product/components/product-form.tsx → types/action.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Docker-based deployment stack (db + web services, VPS/Nginx target)** — docker_compose_db_service, docker_compose_web_service, claude_stack_tecnologica, readme_deploy [INFERRED 0.85]

## Communities (46 total, 13 thin omitted)

### Community 0 - "Admin: Usuários & Login"
Cohesion: 0.06
Nodes (71): EditUserPage(), EditUserPageProps, metadata, metadata, NewUserPage(), LOGIN_RATE_LIMIT, loginAction(), CurrentUser (+63 more)

### Community 1 - "Páginas de Listagem (Admin)"
Cohesion: 0.05
Nodes (53): CategoriesPage(), metadata, dateFormatter, metadata, QuotesPageProps, metadata, SuppliersPage(), metadata (+45 more)

### Community 2 - "Páginas: Config. & Detalhe de Cotação"
Cohesion: 0.06
Nodes (45): metadata, SettingsPage(), dateFormatter, metadata, QuoteDetailPage(), QuoteDetailPageProps, UsersPage(), PublicLayoutProps (+37 more)

### Community 3 - "Páginas: Categorias (CRUD)"
Cohesion: 0.07
Nodes (45): EditCategoryPage(), EditCategoryPageProps, metadata, metadata, NewCategoryPage(), EditProductPage(), EditProductPageProps, metadata (+37 more)

### Community 4 - "Páginas: Fornecedores (CRUD)"
Cohesion: 0.06
Nodes (35): EditSupplierPage(), EditSupplierPageProps, metadata, metadata, metadata, ImageUpload(), ImageUploadProps, normalizePrimary() (+27 more)

### Community 5 - "Componentes de Navegação"
Cohesion: 0.10
Nodes (29): AdminNav(), AdminNavProps, Logo(), MainNav(), MainNavProps, MobileNav(), MobileNavProps, SheetContent (+21 more)

### Community 6 - "Gestão de Cotações (Admin)"
Cohesion: 0.06
Nodes (30): QuotesPage(), UpdateQuoteInput, updateQuoteSchema, AdminQuoteListFilters, AdminQuoteListItem, getQuoteById(), listQuotes(), Env (+22 more)

### Community 7 - "Páginas Públicas (Home/Produtos)"
Cohesion: 0.09
Nodes (27): CategoriesPage(), metadata, HomePage(), metadata, ProductsPage(), ProductsPageProps, readParam(), generateMetadata() (+19 more)

### Community 8 - "Dependências (npm)"
Cohesion: 0.07
Nodes (30): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, framer-motion, lucide-react, next (+22 more)

### Community 9 - "Dashboard (Widgets)"
Cohesion: 0.11
Nodes (23): parseStatus(), AdminDashboardPage(), metadata, QuoteStatusSummary(), QuoteStatusSummaryProps, dateFormatter, RecentQuotes(), RecentQuotesProps (+15 more)

### Community 10 - "Config. do Projeto (package.json)"
Cohesion: 0.07
Nodes (27): engines, node, lint-staged, *.{js,jsx,json,md,mjs,cjs}, *.{ts,tsx}, name, prisma, seed (+19 more)

### Community 11 - "Config. TypeScript"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+18 more)

### Community 12 - "Layout do Painel Admin"
Cohesion: 0.13
Nodes (12): AdminLayoutProps, AdminMobileNav(), AdminSidebar(), AdminTopbar(), logoutAction(), LoginInput, loginSchema, AuthenticatedUser (+4 more)

### Community 13 - "Config. shadcn/ui"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 14 - "Upload de Imagens (API)"
Cohesion: 0.25
Nodes (12): AllowedImageType, POST(), ALLOWED_IMAGE_TYPES, AllowedImageType, isValidUploadFolder(), uploadImage(), EXTENSION_BY_MIME, saveUploadLocally() (+4 more)

### Community 15 - "Deploy & Armazenamento (docs)"
Cohesion: 0.17
Nodes (12): Deploy (Docker/VPS Ubuntu/Nginx), ImageUpload / SingleImageUpload, Stack tecnológica (Next.js 15, React 19, Prisma, PostgreSQL), Upload de imagens 100% local (lib/storage), app/api/admin/upload/route.ts, public/uploads volume persistente, Serviço Docker 'db' (postgres:16-alpine, usuário/senha/db miraf, healthcheck pg_isready), Volume 'miraf-db-data' (persistência dos dados do Postgres) (+4 more)

### Community 16 - "Visão Geral do Projeto (docs)"
Cohesion: 0.18
Nodes (11): Aba Cotações (pendente), Fluxo de Cotação, Layout público (site-header/footer/nav), components/layout/logo.tsx (logotipo oficial), Mira Web Platform, Modo escuro (tokens .dark, não ativado), Objetivo: gerar solicitações de orçamento, Público-alvo (Food Service, Panificação, Confeitaria, Sorveterias) (+3 more)

### Community 17 - "Padrões de Feature (docs)"
Cohesion: 0.22
Nodes (10): Admin de catálogo (CRUD Categorias/Marcas/Produtos), Escopo de conteúdo gerenciável (catálogo + Configurações), Feature dashboard (widgets, somente leitura), Feature settings (Configurações do site), Fluxo Zod → Server Action → Service (Prisma), Guardas de exclusão (respeitam onDelete), Padrão feature-based (schemas/services/actions/components), Estrutura padrão de uma feature (components/actions/services/schemas/types) (+2 more)

### Community 18 - "Autenticação (Auth.js)"
Cohesion: 0.20
Nodes (10): services/authenticate-user.ts, Feature auth (autenticação), lib/auth.ts (runtime Node, Credentials), lib/auth.config.ts (edge-safe), loginAction (features/auth/actions/login.ts), app/login/page.tsx (login em /login), middleware.ts (protege /admin/*), lib/rate-limit.ts (limitador em memória) (+2 more)

### Community 19 - "Modelos de Dados (docs)"
Cohesion: 0.40
Nodes (10): services/dashboard-service.ts (getDashboardStats/getRecentQuotes), Model Brand, Model Category, Model Product, Model ProductImage, Model Quote, Model QuoteItem, Model Recipe (mantido, aba removida) (+2 more)

### Community 20 - "Config. Prettier"
Cohesion: 0.22
Nodes (8): arrowParens, endOfLine, plugins, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 21 - "Fornecedores & Menus (docs)"
Cohesion: 0.40
Nodes (6): constants/navigation.ts (fonte única de menus), Fornecedores (= Marcas, rótulo público), Layout admin (sidebar/nav/topbar), ProductFilters (filtro por fornecedor ?marca=slug), supplier-carousel.tsx (carrossel infinito), supplier-section.tsx (seção em produtos)

### Community 22 - "Feature Usuários"
Cohesion: 0.47
Nodes (6): Feature user (CRUD admins/editores), Gate ADMIN (defesa em profundidade), getCurrentUser() (current-user.ts), Model User, Proteções anti-lockout, services/user-service.ts

### Community 23 - "Infra Prisma & Settings"
Cohesion: 0.33
Nodes (6): lib/prisma.ts, Model Settings, Prisma 7 driver adapter (@prisma/adapter-pg), prisma/seed.ts (idempotente), Cache tag site-settings (revalidateTag), services/site-settings.ts (getSiteSettings/updateSettings)

### Community 24 - "Schema de Configurações"
Cohesion: 0.33
Nodes (4): optionalEmail, optionalUrl, SettingsInput, settingsSchema

### Community 25 - "Componentes do Dashboard"
Cohesion: 0.50
Nodes (5): app/(admin)/admin/dashboard/page.tsx, components/quote-status-badge.tsx (QUOTE_STATUS_LABEL), components/quote-status-summary.tsx, components/recent-quotes.tsx, components/stat-card.tsx

### Community 26 - "Config. ESLint"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 27 - "Tipos next-auth (JWT/Session)"
Cohesion: 0.40
Nodes (4): JWT, next-auth, next-auth/jwt, Session

### Community 28 - "Identidade Visual (Logo Mira)"
Cohesion: 0.50
Nodes (4): Mira (Brand), Mira Official Logo (Light Version), Mira Logo — White ("Branca") Variant, Mira Logo (Preto/Black variant)

## Knowledge Gaps
- **277 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `tabWidth`, `printWidth` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Gestão de Cotações (Admin)` to `Config. do Projeto (package.json)`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `ROUTES` connect `Páginas de Listagem (Admin)` to `Admin: Usuários & Login`, `Páginas: Config. & Detalhe de Cotação`, `Páginas: Categorias (CRUD)`, `Páginas: Fornecedores (CRUD)`, `Componentes de Navegação`, `Páginas Públicas (Home/Produtos)`, `Dashboard (Widgets)`, `Layout do Painel Admin`?**
  _High betweenness centrality (0.093) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _281 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin: Usuários & Login` be split into smaller, more focused modules?**
  _Cohesion score 0.05720122574055159 - nodes in this community are weakly interconnected._
- **Should `Páginas de Listagem (Admin)` be split into smaller, more focused modules?**
  _Cohesion score 0.053069420539300055 - nodes in this community are weakly interconnected._
- **Should `Páginas: Config. & Detalhe de Cotação` be split into smaller, more focused modules?**
  _Cohesion score 0.059907834101382486 - nodes in this community are weakly interconnected._
- **Should `Páginas: Categorias (CRUD)` be split into smaller, more focused modules?**
  _Cohesion score 0.07305669199298656 - nodes in this community are weakly interconnected._