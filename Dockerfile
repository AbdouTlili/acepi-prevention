FROM node:20-alpine AS base

# --- deps ---
FROM base AS deps
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY package*.json ./
RUN npm ci

# --- builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Switch Prisma provider from sqlite → postgresql for production build
RUN sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma
RUN npx prisma generate
# Compile seed.ts to plain JS so runner doesn't need ts-node
RUN node_modules/.bin/tsc \
  --module commonjs --target es2020 \
  --esModuleInterop --skipLibCheck \
  --outDir prisma/compiled \
  prisma/seed.ts
RUN npm run build

# --- runner ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# OpenSSL is required by the Prisma query engine on Alpine
RUN apk add --no-cache openssl
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Schema + migrations + compiled seed — owned by nextjs so Prisma CLI can write
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Prisma client engines — nextjs needs write access for Prisma engine extraction
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
# Prisma CLI (needed to run migrate deploy)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
# bcryptjs is bundled by Next.js into route chunks, not in standalone node_modules — add it for seed.js
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/bcryptjs ./node_modules/bcryptjs

USER nextjs
EXPOSE 3000
ENV PORT=3000
# Run migrations, seed defaults (idempotent), then start
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node prisma/compiled/seed.js && node server.js"]
