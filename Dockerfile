# ---- Base ----
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install build dependencies for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ curl --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# ---- Prune: extract minimal monorepo subset for the CLI and UI ----
FROM base AS pruner
WORKDIR /app
COPY . .
# We use the package names defined in package.json: spark-edge (cli) and spark-edge-ui (frontend)
RUN pnpm dlx turbo prune spark-edge spark-edge-ui --docker

# ---- Installer: Install dependencies and build ----
FROM base AS installer
WORKDIR /app

# 1. Copy manifests for cache optimization
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 2. Copy source and build everything
COPY --from=pruner /app/out/full/ .
RUN pnpm dlx turbo run build --filter=spark-edge --filter=spark-edge-ui

# ---- Runner: Production image ----
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy built artifacts and production node_modules
# We copy the whole /app from installer then remove source code to keep it clean, 
# or copy specific packages. Using the injectWorkspacePackages flow, copying all is safer.
COPY --from=installer /app .

# Expose the unified port
EXPOSE 3009

# Start the CLI which now serves the UI
CMD ["pnpm", "--filter", "spark-edge", "start"]
