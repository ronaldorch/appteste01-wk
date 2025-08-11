#!/bin/bash

echo "🛍️ Configurando Marketplace Completo..."
echo "======================================"

cd /var/www/azure-site

# 1. Verificar se o banco está configurado
if [ ! -f ".env.local" ]; then
    echo "❌ Configure o banco primeiro com: ./scripts/setup-database-connection.sh"
    exit 1
fi

# 2. Carregar variáveis
export $(grep -v '^#' .env.local | xargs)

# 3. Executar script de tabelas do marketplace
echo "🗄️ Criando tabelas do marketplace..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/marketplace-tables.sql

if [ $? -eq 0 ]; then
    echo "✅ Tabelas do marketplace criadas!"
else
    echo "❌ Erro ao criar tabelas!"
    exit 1
fi

# 4. Parar aplicação
echo "🔄 Parando aplicação..."
pm2 stop azure-site

# 5. Build
echo "🏗️ Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 6. Reiniciar
echo "🚀 Reiniciando aplicação..."
pm2 start azure-site
sleep 5

# 7. Teste
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ MARKETPLACE COMPLETO CONFIGURADO!"
echo "🎉 ======================================="
echo ""
echo "🛍️ Acesse:"
echo "   Loja: http://$PUBLIC_IP"
echo "   Produtos: http://$PUBLIC_IP/produtos"
echo "   Dashboard: http://$PUBLIC_IP/dashboard"
echo ""
echo "📋 Credenciais:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "✨ Recursos disponíveis:"
echo "   ✅ Marketplace público"
echo "   ✅ Sistema de carrinho"
echo "   ✅ Checkout completo"
echo "   ✅ Dashboard com dados reais"
echo "   ✅ Páginas de produto"
echo "   ✅ Sistema de pedidos"
echo "   ✅ Perfil de usuário"
