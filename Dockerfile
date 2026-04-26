# Estágio Base
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate
WORKDIR /app

# Estágio de Builder (Instalação e Compilação)
FROM base AS builder
# Ferramentas para módulos nativos (sqlite)
RUN apk add --no-cache python3 make g++

# Copia TODOS os arquivos do projeto (respeitando o .dockerignore)
# Isso inclui package.json, pnpm-lock.yaml, workspace configs e as pastas packages/
COPY . .

# Instala as dependências de produção para Linux
# O pnpm vai criar todos os links simbólicos necessários entre os pacotes
RUN pnpm install --frozen-lockfile --prod

# Estágio Final (Runner)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia tudo que foi preparado (incluindo as node_modules e dists vinculadas)
COPY --from=builder /app /app

# Garante que o entrypoint tenha permissão de execução
RUN chmod +x ./entrypoint.sh

EXPOSE 3009
ENTRYPOINT ["./entrypoint.sh"]
