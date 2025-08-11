#!/bin/bash
echo "🧹 Limpando tudo na máquina..."

# Parar todos os processos
pm2 kill 2>/dev/null || true
sudo pkill -f "node" 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# Remover aplicação anterior
sudo rm -rf /var/www/azure-site 2>/dev/null || true
sudo rm -rf ~/.pm2 2>/dev/null || true

# Limpar configurações nginx
sudo rm -f /etc/nginx/sites-enabled/* 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/azure-site 2>/dev/null || true

# Remover Node.js e NPM
sudo apt remove -y nodejs npm 2>/dev/null || true
sudo apt autoremove -y 2>/dev/null || true

# Limpar caches
rm -rf ~/.npm ~/.cache 2>/dev/null || true

echo "✅ Limpeza concluída!"
