# Stage 1: Build & Dependencies
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate
COPY . .

# Stage 2: Runtime Production (Hanya menyalin berkas krusial, ukuran image < 150MB)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ARG APP_PORT=3000
ENV APP_PORT=${APP_PORT}

COPY package*.json ./
# Hanya menginstal dependensi produksi saja
RUN npm ci

# Menyalin hasil generate prisma client dan source code dari stage builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

EXPOSE ${APP_PORT}

CMD ["node", "src/main.js"]