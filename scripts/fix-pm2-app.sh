#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Corrigindo aplicação PM2...${NC}"

# Parar aplicação atual
echo -e "${YELLOW}⏹️ Parando aplicação atual...${NC}"
pm2 stop azure-site 2>/dev/null || true
pm2 delete azure-site 2>/dev/null || true

# Criar novo ecosystem.config.js
echo -e "${YELLOW}⚙️ Criando configuração PM2...${NC}"

cat > /var/www/azure-site/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'estacao-fumaca',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/azure-site',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/estacao-fumaca-error.log',
    out_file: '/var/log/pm2/estacao-fumaca-out.log',
    log_file: '/var/log/pm2/estacao-fumaca.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000
  }]
}
EOF

# Verificar se o build existe
if [ ! -d "/var/www/azure-site/.next" ]; then
    echo -e "${YELLOW}🏗️ Build não encontrado, executando build...${NC}"
    cd /var/www/azure-site
    npm run build
fi

# Iniciar aplicação
echo -e "${YELLOW}🚀 Iniciando aplicação...${NC}"
cd /var/www/azure-site
pm2 start ecosystem.config.js

# Aguardar inicialização
sleep 5

# Verificar status
echo -e "${YELLOW}🔍 Verificando status...${NC}"
pm2 status

# Testar se a aplicação está respondendo
echo -e "${YELLOW}🔍 Testando aplicação...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação está respondendo${NC}"
else
    echo -e "${RED}❌ Aplicação não está respondendo${NC}"
    echo -e "${YELLOW}📋 Logs da aplicação:${NC}"
    pm2 logs estacao-fumaca --lines 20
    exit 1
fi

# Salvar configuração PM2
pm2 save

echo -e "${GREEN}🎉 PM2 configurado com sucesso!${NC}"
echo -e "${GREEN}📊 Status: $(pm2 jlist | jq -r '.[0].pm2_env.status')${NC}"
echo -e "${GREEN}🌐 Aplicação rodando em: http://localhost:3000${NC}"
