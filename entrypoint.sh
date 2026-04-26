#!/bin/sh
set -e

# Rodar comandos do Drizzle para preparar o banco
echo "Preparando banco de dados (Drizzle)..."
pnpm --filter spark-edge-db run db:generate
pnpm --filter spark-edge-db run db:migrate

# (Opcional) Se quiser rodar o seed também:
# pnpm --filter spark-edge-db run db:seed

echo "Iniciando spark-edge..."
exec node packages/cli/bin/spark-edge
