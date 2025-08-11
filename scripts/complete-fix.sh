#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌿 =======================================================${NC}"
echo -e "${BLUE}🚀 ESTAÇÃO DA FUMAÇA - CORREÇÃO COMPLETA${NC}"
echo -e "${BLUE}🌿 =======================================================${NC}"
echo -e "${YELLOW}⚠️  Este script corrigirá todos os problemas identificados:${NC}"
echo -e "${YELLOW}📋 1. Schema do banco de dados${NC}"
echo -e "${YELLOW}📋 2. Configuração do Nginx${NC}"
echo -e "${YELLOW}📋 3. Aplicação PM2${NC}"
echo -e "${YELLOW}📋 4. Testes finais${NC}"
echo

read -p "🤔 Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Operação cancelada${NC}"
    exit 1
fi

echo -e "${GREEN}🚀 Iniciando correção completa...${NC}"
echo "========================================="

# 1. Corrigir banco de dados
echo -e "${BLUE}1️⃣ Corrigindo banco de dados...${NC}"
if ./scripts/fix-database-schema.sh; then
    echo -e "${GREEN}✅ Banco corrigido${NC}"
else
    echo -e "${RED}❌ Erro ao corrigir banco${NC}"
    exit 1
fi

echo
echo "========================================="

# 2. Corrigir Nginx
echo -e "${BLUE}2️⃣ Corrigindo Nginx...${NC}"
if sudo ./scripts/fix-nginx-config.sh; then
    echo -e "${GREEN}✅ Nginx corrigido${NC}"
else
    echo -e "${RED}❌ Erro ao corrigir Nginx${NC}"
    exit 1
fi

echo
echo "========================================="

# 3. Corrigir PM2
echo -e "${BLUE}3️⃣ Corrigindo PM2...${NC}"
if ./scripts/fix-pm2-app.sh; then
    echo -e "${GREEN}✅ PM2 corrigido${NC}"
else
    echo -e "${RED}❌ Erro ao corrigir PM2${NC}"
    exit 1
fi

echo
echo "========================================="

# 4. Testes finais
echo -e "${BLUE}4️⃣ Executando testes finais...${NC}"

# Aguardar aplicação estabilizar
echo -e "${YELLOW}⏳ Aguardando aplicação estabilizar...${NC}"
sleep 10

# Testar aplicação local
echo -e "${YELLOW}🔍 Testando aplicação local...${NC}"
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação local OK${NC}"
else
    echo -e "${RED}❌ Aplicação local com problemas${NC}"
    pm2 logs estacao-fumaca --lines 10
fi

# Testar Nginx
echo -e "${YELLOW}🔍 Testando Nginx...${NC}"
if sudo nginx -t > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Nginx OK${NC}"
else
    echo -e "${RED}❌ Nginx com problemas${NC}"
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "IP_NAO_ENCONTRADO")

echo
echo -e "${BLUE}🌿 =======================================================${NC}"
echo -e "${GREEN}🎉 CORREÇÃO COMPLETA FINALIZADA!${NC}"
echo -e "${BLUE}🌿 =======================================================${NC}"
echo
echo -e "${GREEN}✅ Status dos Serviços:${NC}"
echo -e "${GREEN}   🗄️  Banco de dados: Corrigido${NC}"
echo -e "${GREEN}   🌐 Nginx: $(sudo systemctl is-active nginx)${NC}"
echo -e "${GREEN}   🚀 PM2: $(pm2 jlist | jq -r '.[0].pm2_env.status' 2>/dev/null || echo 'Verificar manualmente')${NC}"
echo
echo -e "${GREEN}🌐 URLs de Acesso:${NC}"
echo -e "${GREEN}   🏠 Homepage: http://$PUBLIC_IP${NC}"
echo -e "${GREEN}   🛒 Catálogo: http://$PUBLIC_IP/produtos${NC}"
echo -e "${GREEN}   👨‍💼 Admin: http://$PUBLIC_IP/admin${NC}"
echo
echo -e "${GREEN}👤 Usuários Criados:${NC}"
echo -e "${GREEN}   📧 admin@estacaofumaca.com / admin123${NC}"
echo -e "${GREEN}   📧 demo@exemplo.com / 123456${NC}"
echo
echo -e "${YELLOW}🔧 Comandos Úteis:${NC}"
echo -e "${YELLOW}   pm2 status - Ver status da aplicação${NC}"
echo -e "${YELLOW}   pm2 logs estacao-fumaca - Ver logs${NC}"
echo -e "${YELLOW}   sudo systemctl status nginx - Status do Nginx${NC}"
echo
echo -e "${BLUE}🌿 Estação da Fumaça - Da boca pra sua porta, sem vacilo! 🌿${NC}"
