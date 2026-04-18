![Banner image](assets/banner.png)

# SparkEdge

O SparkEdge é uma plataforma baseada de automação para monitoramento com node, visando sistemas de energia fotovoltáicos on-grid e off-grid. A plataforma oferece e permite integração, automação e execução de código para coleta de dados em sistemas de energia permitindo maior controle na automação e envio de dados.

# Principais capacidades
- **Integração com Código Python**: É possivel usar código em python para coleta de dados e adicionar como uma instancia.
- **Controle Total**: Você define o que fazer com os dados de monitoramento que foram coletados.
- **Serviço local**: Permite rodar em sistemas mais criticos tendo flexibilidade em conseguir armazenar dados e enviar quando houver conexão.

# Como rodar (Versão desenvolvimento)
Primeiro você deve instalar o pnpm e depois instalar todas as dependencias com 
```bash
pnpm install
```
Esse comando percorre todo o monorepo e instala tudo.

Database notes
Running `pnpm dev` will automatically run DB migrations and seeds (via workspace predev scripts). You can also run the DB commands manually:
	- `pnpm -w run db:generate` — generate SQL migration(s) based on the current schema
	- `pnpm -w run db:migrate` — apply pending migrations and create the database file (`packages/db/monitor.db`)
	- `pnpm -w run db:seed` — run the basic seeding script

Em seguida execute:

```bash
pnpm dev
```

Abra o SparkEdge no http://localhost:5173

# O que significa SparkEdge?
O nome SparkEdge simboliza o "faiscar" (spark) da energia e da inteligência processada na "borda" (edge) da rede, refletindo o foco da plataforma em processamento local e monitoramento eficiente de sistemas de energia.