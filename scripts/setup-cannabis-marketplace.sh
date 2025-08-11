#!/bin/bash

echo "🌿 Configurando GreenLeaf Cannabis Marketplace..."

# Verificar se o PostgreSQL está rodando
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL não está rodando. Iniciando..."
    sudo systemctl start postgresql
    sleep 3
fi

# Verificar variáveis de ambiente
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_NAME" ]; then
    echo "⚠️  Configurando variáveis de ambiente padrão..."
    export DB_HOST="localhost"
    export DB_USER="postgres"
    export DB_PASSWORD="postgres"
    export DB_NAME="greenleaf_db"
    export DB_PORT="5432"
fi

echo "📊 Executando script SQL para produtos de cannabis..."

# Executar o script SQL
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/cannabis-products.sql

if [ $? -eq 0 ]; then
    echo "✅ Produtos de cannabis inseridos com sucesso!"
else
    echo "❌ Erro ao inserir produtos. Verificando conexão..."
    exit 1
fi

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Construir o projeto
echo "🔨 Construindo o projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build. Verificando..."
    exit 1
fi

# Iniciar o servidor
echo "🚀 Iniciando GreenLeaf Cannabis Marketplace..."
echo ""
echo "🌿 =================================="
echo "   GREENLEAF CANNABIS MARKETPLACE"
echo "🌿 =================================="
echo ""
echo "✅ Produtos disponíveis:"
echo "   🌿 Flores: Colombian Gold, Califa Kush, Purple Haze"
echo "   💧 Extrações: Live Resin, Shatter, Rosin, Wax"
echo ""
echo "🔗 URLs disponíveis:"
echo "   📱 Loja: http://localhost:3000"
echo "   🛍️  Produtos: http://localhost:3000/produtos"
echo "   👨‍💼 Admin: http://localhost:3000/admin"
echo ""
echo "🎯 Categorias:"
echo "   🌿 Flores: /produtos?category=flores"
echo "   💧 Extrações: /produtos?category=extracoes"
echo ""

# Iniciar com PM2 se disponível, senão usar npm
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando com PM2..."
    pm2 delete greenleaf-app 2>/dev/null || true
    pm2 start npm --name "greenleaf-app" -- start
    pm2 save
    echo "✅ GreenLeaf rodando com PM2!"
else
    echo "🔄 Iniciando com npm..."
    npm start
fi

echo ""
echo "🌿 GreenLeaf Cannabis Marketplace está rodando!"
echo "   Acesse: http://localhost:3000"
echo ""
