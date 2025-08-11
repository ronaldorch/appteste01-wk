#!/bin/bash

echo "🛍️ Configurando E-commerce..."
echo "============================"

cd /var/www/azure-site

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório da aplicação (/var/www/azure-site)"
    exit 1
fi

# 2. Verificar se o banco está configurado
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "   Configure o banco primeiro com: ./scripts/setup-database-connection.sh"
    exit 1
fi

# 3. Carregar variáveis do banco
echo "📋 Carregando configurações do banco..."
export $(grep -v '^#' .env.local | xargs)

if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Configurações do banco não encontradas no .env.local"
    echo "   Configure o banco primeiro com: ./scripts/setup-database-connection.sh"
    exit 1
fi

echo "✅ Configurações carregadas:"
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# 4. Testar conexão
echo ""
echo "🔍 Testando conexão com banco..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ Não foi possível conectar ao banco!"
    echo "   Verifique se:"
    echo "   - O banco PostgreSQL está rodando"
    echo "   - As credenciais estão corretas"
    echo "   - A VM do banco está acessível"
    exit 1
fi

echo "✅ Conexão com banco OK!"

# 5. Verificar se o script SQL existe
if [ ! -f "scripts/ecommerce-setup.sql" ]; then
    echo "❌ Script ecommerce-setup.sql não encontrado!"
    echo "   Certifique-se de que o arquivo foi criado corretamente"
    exit 1
fi

# 6. Executar script SQL
echo ""
echo "🗄️ Executando script SQL do e-commerce..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/ecommerce-setup.sql

if [ $? -eq 0 ]; then
    echo "✅ Script SQL executado com sucesso!"
else
    echo "❌ Erro ao executar script SQL!"
    exit 1
fi

# 7. Verificar se as tabelas foram criadas
echo ""
echo "🔍 Verificando tabelas criadas..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
\echo '📊 Tabelas do e-commerce:'
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'products', 'product_images', 'orders', 'order_items')
ORDER BY table_name;

\echo ''
\echo '📈 Dados de exemplo:'
SELECT 'Categorias' as tabela, COUNT(*) as total FROM categories
UNION ALL
SELECT 'Produtos' as tabela, COUNT(*) as total FROM products
UNION ALL
SELECT 'Pedidos' as tabela, COUNT(*) as total FROM orders;
EOF

# 8. Parar aplicação
echo ""
echo "🔄 Parando aplicação..."
pm2 stop azure-site

# 9. Rebuild
echo "🏗️ Fazendo rebuild..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 10. Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 start azure-site
sleep 5

# 11. Verificar se está funcionando
echo "🔍 Verificando aplicação..."
if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ Aplicação reiniciada com sucesso!"
else
    echo "❌ Erro ao reiniciar aplicação"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 12. Teste final
echo ""
echo "🧪 Teste final..."
sleep 3

if curl -f http://localhost:3000/dashboard > /dev/null 2>&1; then
    echo "✅ Dashboard acessível!"
else
    echo "❌ Dashboard não acessível"
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ E-COMMERCE CONFIGURADO COM SUCESSO!"
echo "🎉 ======================================="
echo ""
echo "🛍️ Acesse sua loja:"
echo "   Dashboard: http://$PUBLIC_IP/dashboard"
echo "   Produtos:  http://$PUBLIC_IP/dashboard/products"
echo "   Pedidos:   http://$PUBLIC_IP/dashboard/orders"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "🗄️ Banco configurado com:"
echo "   - 5 categorias de exemplo"
echo "   - 5 produtos de exemplo"
echo "   - Estrutura completa de e-commerce"
echo ""
echo "🔧 Para monitorar: pm2 logs azure-site"
