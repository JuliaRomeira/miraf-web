# syntax=docker/dockerfile:1.7
# =============================================================================
# Miraf Web Platform — Dockerfile de produção
# =============================================================================
# Estratégia multi-stage:
#   1) deps      → instala apenas dependências (cache)
#   2) builder   → gera o build standalone do Next.js
#   3) runner    → imagem final mínima, sem dev dependencies
#
# Requer `output: "standalone"` no next.config.ts.
# =============================================================================

ARG NODE_VERSION=20-alpine

# --- Stage 1: dependências ----------------------------------------------------
FROM node:${NODE_VERSION} AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
# --ignore-scripts para pular o postinstall (prisma generate) — geramos no builder
RUN npm ci --ignore-scripts

# --- Stage 2: build -----------------------------------------------------------
FROM node:${NODE_VERSION} AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# --- Stage 3: runtime ---------------------------------------------------------
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache openssl curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Cria usuário não-root para rodar a aplicação
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# Copia apenas os artefatos necessários do build standalone
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma engine necessário em runtime (client já vem embutido no bundle standalone)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
