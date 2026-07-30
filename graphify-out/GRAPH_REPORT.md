# Graph Report - .  (2026-07-28)

## Corpus Check
- Large corpus: 213 files · ~1,180,770 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 874 nodes · 2024 edges · 42 communities (39 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Páginas app-router & institucional
- Layout & navegação do painel
- Cotação (detalhe) & layout público
- Home & listagens públicas
- Painel — listagens (cotações/categorias)
- Admin — cadastro de Produto
- Admin — Categorias
- Admin — Usuários & Configurações
- Dependências (npm)
- Auth & upload (rotas/schemas)
- Dashboard do painel
- TypeScript config
- Auth actions & rate limit
- Admin — Server Actions (escrita)
- DevDependencies (npm)
- Config shadcn/ui
- Scripts npm
- Fornecedores (schema/service)
- Catálogo — filtros & busca
- Sabores & tabela nutricional
- Página de detalhe do produto
- Botões de cotação (stepper/add)
- Fluxo de cotação (página)
- Nossas Unidades
- Config do pacote (package.json)
- Descrição rica & sanitização
- Admin — Cotações (service)
- Carrinho de cotação (store)
- Admin — Fornecedores (páginas)
- Prettier config
- Env & Prisma client
- Card de produto & relacionados
- Configurações (schema)
- ESLint config
- Tipos Auth.js
- Next config
- PostCSS config
- API handlers

## God Nodes (most connected - your core abstractions)
1. `ROUTES` - 65 edges
2. `cn()` - 59 edges
3. `Button` - 38 edges
4. `actionError()` - 29 edges
5. `guardAdminWrite()` - 28 edges
6. `ActionResult` - 25 edges
7. `compilerOptions` - 23 edges
8. `actionFromZodError()` - 21 edges
9. `actionSuccess()` - 21 edges
10. `scripts` - 17 edges

## Surprising Connections (you probably didn't know these)
- `AdminLayout()` --calls--> `getCurrentUser()`  [EXTRACTED]
  app/(admin)/layout.tsx → features/auth/services/current-user.ts
- `PaginationArrow()` --calls--> `cn()`  [EXTRACTED]
  app/(public)/produtos/page.tsx → lib/utils.ts
- `DeleteButtonProps` --references--> `ActionResult`  [EXTRACTED]
  components/shared/delete-button.tsx → types/action.ts
- `QuoteDetailPage()` --references--> `ROUTES`  [EXTRACTED]
  app/(admin)/admin/cotacoes/[id]/page.tsx → constants/site.ts
- `parseStatus()` --references--> `QUOTE_STATUS_ORDER`  [EXTRACTED]
  app/(admin)/admin/cotacoes/page.tsx → features/quote/constants/quote-status.ts

## Import Cycles
- None detected.

## Communities (42 total, 3 thin omitted)

### Community 0 - "Páginas app-router & institucional"
Cohesion: 0.05
Nodes (62): ErrorPageProps, metadata, ABOUT_STATS, AboutStat, metadata, ImageUpload(), ImageUploadProps, normalizePrimary() (+54 more)

### Community 1 - "Layout & navegação do painel"
Cohesion: 0.05
Nodes (63): AdminLayout(), AdminLayoutProps, AdminMobileNav(), AdminMobileNavProps, AdminNav(), AdminNavProps, AdminSidebar(), AdminSidebarProps (+55 more)

### Community 2 - "Cotação (detalhe) & layout público"
Cohesion: 0.05
Nodes (47): dateFormatter, metadata, QuoteDetailPage(), QuoteDetailPageProps, archivo, geistMono, metadata, publicSans (+39 more)

### Community 3 - "Home & listagens públicas"
Cohesion: 0.06
Nodes (43): GET(), CategoriesPage(), metadata, metadata, pageWindow(), PaginationArrow(), ProductsPage(), ProductsPageProps (+35 more)

### Community 4 - "Painel — listagens (cotações/categorias)"
Cohesion: 0.09
Nodes (33): CategoriesPage(), metadata, dateFormatter, metadata, parseStatus(), QuotesPage(), QuotesPageProps, metadata (+25 more)

### Community 5 - "Admin — cadastro de Produto"
Cohesion: 0.10
Nodes (34): EditProductPage(), EditProductPageProps, metadata, metadata, NewProductPage(), listCategoryTree(), ProductForm(), NUTRIENT_KINDS (+26 more)

### Community 6 - "Admin — Categorias"
Cohesion: 0.12
Nodes (28): EditCategoryPage(), EditCategoryPageProps, metadata, metadata, createCategoryAction(), createSubcategoryAction(), deleteSubcategoryAction(), extractCategoryInput() (+20 more)

### Community 7 - "Admin — Usuários & Configurações"
Cohesion: 0.08
Nodes (30): metadata, SettingsPage(), EditUserPage(), EditUserPageProps, metadata, metadata, NewUserPage(), UsersPage() (+22 more)

### Community 8 - "Dependências (npm)"
Cohesion: 0.06
Nodes (33): dependencies, bcryptjs, class-variance-authority, clsx, dotenv, lucide-react, next, next-auth (+25 more)

### Community 9 - "Auth & upload (rotas/schemas)"
Cohesion: 0.12
Nodes (19): AllowedImageType, POST(), LoginInput, loginSchema, AuthenticatedUser, authenticateUser(), { handlers, auth, signIn, signOut }, ALLOWED_IMAGE_TYPES (+11 more)

### Community 10 - "Dashboard do painel"
Cohesion: 0.12
Nodes (21): AdminDashboardPage(), metadata, QuoteStatusSummary(), QuoteStatusSummaryProps, dateFormatter, RecentQuotes(), RecentQuotesProps, StatCard() (+13 more)

### Community 11 - "TypeScript config"
Cohesion: 0.07
Nodes (26): compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames, incremental, isolatedModules, jsx (+18 more)

### Community 12 - "Auth actions & rate limit"
Cohesion: 0.17
Nodes (19): LOGIN_RATE_LIMIT, loginAction(), ADMIN_WRITE_RATE_LIMIT, WriteGuardOptions, WriteGuardResult, createQuoteAction(), parseItems(), QUOTE_RATE_LIMIT (+11 more)

### Community 13 - "Admin — Server Actions (escrita)"
Cohesion: 0.26
Nodes (20): guardAdminWrite(), deleteCategoryAction(), createProductAction(), deleteProductAction(), extractProductInput(), updateProductAction(), validateNutritionServings(), updateQuoteAction() (+12 more)

### Community 14 - "DevDependencies (npm)"
Cohesion: 0.10
Nodes (20): devDependencies, eslint, eslint-config-next, eslint-config-prettier, @eslint/eslintrc, husky, lint-staged, prettier (+12 more)

### Community 15 - "Config shadcn/ui"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 16 - "Scripts npm"
Cohesion: 0.12
Nodes (17): scripts, build, dev, format, format:check, lint, lint:fix, postinstall (+9 more)

### Community 17 - "Fornecedores (schema/service)"
Cohesion: 0.24
Nodes (12): deleteCategory(), deleteProduct(), deleteSupplierAction(), SupplierInput, supplierSchema, createSupplier(), deleteSupplier(), generateUniqueSlug() (+4 more)

### Community 18 - "Catálogo — filtros & busca"
Cohesion: 0.19
Nodes (11): CatalogFilterPanel(), CatalogFilterPanelProps, CategoryNode, CatalogSearchField(), CategoryFilter(), CategoryFilterProps, CategoryNode, CategoryOption (+3 more)

### Community 19 - "Sabores & tabela nutricional"
Cohesion: 0.23
Nodes (9): FlavorProductViewProps, ViewFlavor, NutritionTable(), NutritionTableProps, NUTRIENT_DEFINITIONS, NutrientDefinition, NutritionRowView, NutritionView (+1 more)

### Community 20 - "Página de detalhe do produto"
Cohesion: 0.24
Nodes (11): generateMetadata(), metaSummary(), ProductDetailPage(), ProductDetailPageProps, ProductHelpCta(), ProductHighlights(), ProductSpec, ProductSpecs() (+3 more)

### Community 21 - "Botões de cotação (stepper/add)"
Cohesion: 0.28
Nodes (9): QuantityStepper(), QuantityStepperProps, AddToQuoteButton(), AddToQuoteButtonProps, CardAddToQuoteButton(), CardAddToQuoteButtonProps, FlavorProductView(), QuoteCartInput (+1 more)

### Community 22 - "Fluxo de cotação (página)"
Cohesion: 0.20
Nodes (8): metadata, QuoteSuccess, initialState, QuoteCartView(), QuoteForm(), QuoteItemList(), QuoteSuccess(), QuoteSuccessProps

### Community 23 - "Nossas Unidades"
Cohesion: 0.25
Nodes (7): metadata, buildMapUrl(), UnitCard(), UnitCardProps, COMPANY_UNITS, CompanyUnit, UnitType

### Community 24 - "Config do pacote (package.json)"
Cohesion: 0.18
Nodes (10): engines, node, lint-staged, *.{js,jsx,json,md,mjs,cjs}, *.{ts,tsx}, name, prisma, seed (+2 more)

### Community 25 - "Descrição rica & sanitização"
Cohesion: 0.29
Nodes (8): ProductDescription(), ProductDescriptionProps, COLOR_PATTERNS, escapeHtml(), plainTextToHtml(), renderRichText(), SANITIZE_OPTIONS, sanitize-html

### Community 26 - "Admin — Cotações (service)"
Cohesion: 0.33
Nodes (7): deleteQuoteAction(), UpdateQuoteInput, updateQuoteSchema, AdminQuoteListFilters, AdminQuoteListItem, deleteQuote(), updateQuote()

### Community 27 - "Carrinho de cotação (store)"
Cohesion: 0.31
Nodes (9): clampQuantity(), lineKey(), QuoteCartContext, QuoteCartContextValue, QuoteCartItem, QuoteCartProvider(), QuoteCartProviderProps, readStoredCart() (+1 more)

### Community 28 - "Admin — Fornecedores (páginas)"
Cohesion: 0.25
Nodes (6): EditSupplierPage(), EditSupplierPageProps, metadata, metadata, SupplierForm(), getSupplierById()

### Community 29 - "Prettier config"
Cohesion: 0.22
Nodes (8): arrowParens, endOfLine, plugins, printWidth, semi, singleQuote, tabWidth, trailingComma

### Community 30 - "Env & Prisma client"
Cohesion: 0.33
Nodes (4): Env, envSchema, parsedEnv, prisma

### Community 31 - "Card de produto & relacionados"
Cohesion: 0.53
Nodes (4): CatalogProduct, ProductCard(), RelatedProducts(), RelatedProductsProps

### Community 32 - "Configurações (schema)"
Cohesion: 0.33
Nodes (4): optionalEmail, optionalUrl, SettingsInput, settingsSchema

### Community 33 - "ESLint config"
Cohesion: 0.40
Nodes (4): compat, __dirname, eslintConfig, __filename

### Community 34 - "Tipos Auth.js"
Cohesion: 0.40
Nodes (4): JWT, next-auth, next-auth/jwt, Session

## Knowledge Gaps
- **309 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `tabWidth`, `printWidth` (+304 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ROUTES` connect `Layout & navegação do painel` to `Páginas app-router & institucional`, `Cotação (detalhe) & layout público`, `Home & listagens públicas`, `Painel — listagens (cotações/categorias)`, `Admin — cadastro de Produto`, `Admin — Categorias`, `Admin — Usuários & Configurações`, `Dashboard do painel`, `Auth actions & rate limit`, `Admin — Server Actions (escrita)`, `Fornecedores (schema/service)`, `Sabores & tabela nutricional`, `Página de detalhe do produto`, `Botões de cotação (stepper/add)`, `Fluxo de cotação (página)`, `Nossas Unidades`, `Admin — Cotações (service)`, `Admin — Fornecedores (páginas)`, `Card de produto & relacionados`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `DevDependencies (npm)` to `Config do pacote (package.json)`, `Env & Prisma client`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Why does `prisma` connect `Env & Prisma client` to `DevDependencies (npm)`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _309 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Páginas app-router & institucional` be split into smaller, more focused modules?**
  _Cohesion score 0.051526251526251524 - nodes in this community are weakly interconnected._
- **Should `Layout & navegação do painel` be split into smaller, more focused modules?**
  _Cohesion score 0.0519219736087206 - nodes in this community are weakly interconnected._
- **Should `Cotação (detalhe) & layout público` be split into smaller, more focused modules?**
  _Cohesion score 0.05407925407925408 - nodes in this community are weakly interconnected._