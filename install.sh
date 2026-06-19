#!/bin/bash
# install.sh

echo "🔧 Instalando Spark Edge..."

# Node.js 20+
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 20 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash
  sudo apt install -y nodejs
fi

# Bun 1.0+
if ! command -v bun &> /dev/null; then
  echo "🚀 Instalando Bun..."
  curl -fsSL https://bun.sh/install | bash
  sudo ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
fi

# Instala o spark-edge
sudo npm install -g spark-edge

# Serviço systemd
sudo tee /etc/systemd/system/spark-edge.service > /dev/null <<EOF
[Unit]
Description=Spark Edge
After=network.target

[Service]
ExecStart=$(which spark-edge)
Restart=always
RestartSec=5
User=$USER
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable spark-edge
sudo systemctl start spark-edge

echo "✅ Spark Edge instalado e rodando em http://localhost:3009"
