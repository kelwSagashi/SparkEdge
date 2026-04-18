![Banner image](assets/banner.png)

# spark-edge - Agente de Automação de Monitoramento em Nó

O spark-edge é uma plataforma baseada em workflows de automação para monitoramento com nós, visando sistemas de energia fotovoltáicos on-grid e off-grid. A plataforma oferece e permite integração, automação e execução de código de baixo nível que fazem coleta de dados em dispositivos computadores conectados diretamente à sistemas de energia, seja por cabo ou rede, permitindo maior controle na automação de armazenamento e envio de dados.

# Principais capacidades
- **Integração com Código Python**: É possivel escrever código em python para coleta de dados e adicionar como um nó executável.
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

Abra o spark-edge no http://localhost:5173

# O que significa Spark Edge?
O nome Spark Edge simboliza o "faiscar" (spark) da energia e da inteligência processada na "borda" (edge) da rede, refletindo o foco da plataforma em processamento local e monitoramento eficiente de sistemas de energia.