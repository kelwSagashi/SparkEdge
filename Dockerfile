FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar arquivos de configuração do workspace
COPY package.json ./
COPY pnpm-workspace.yaml ./

# Copiar os pacotes mantendo a estrutura para que os symlinks do node_modules funcionem
# O .dockerignore já filtra src e arquivos .ts, mantendo apenas bin, dist e package.json
COPY packages/cli ./packages/cli
COPY packages/core ./packages/core
COPY packages/db ./packages/db
COPY packages/@spark-edge/di ./packages/@spark-edge/di

# Copiar o build do frontend para a pasta public (servida pelo server.ts)
COPY packages/frontend/dist ./public

# Copiar node_modules (assume-se que foram instalados/compilados corretamente para Linux)
COPY node_modules ./node_modules

COPY entrypoint.sh ./entrypoint.sh

EXPOSE 3009
ENTRYPOINT ["./entrypoint.sh"]