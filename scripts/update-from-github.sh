#!/bin/bash
echo "🔄 Atualizando aplicação do GitHub..."

APP_DIR="/var/www/azure-site"
cd $APP_DIR

# Fazer backup das configurações
cp .env.local /tmp/.env.local.backup 2>/dev/null || true

# Atualizar código
echo "📥 Puxando atualizações..."
git pull origin main

# Restaurar configurações
cp /tmp/.env.local.backup .env.local 2>/dev/null || true

# Reinstalar dependências
echo "📦 Atualizando dependências..."
npm install

# Rebuild
echo "🔨 Fazendo rebuild..."
npm run build

# Reiniciar aplicação
echo "🔄 Reiniciando aplicação..."
pm2 restart azure-site

echo "✅ Atualização concluída!"
pm2 status
