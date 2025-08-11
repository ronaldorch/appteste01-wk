#!/bin/bash

echo "👤 CRIAR USUÁRIO DA APLICAÇÃO (Execute na vm-private)"
echo "=================================================="
echo ""

read -p "🔐 Senha do postgres: " -s POSTGRES_PASSWORD
echo ""
read -p "👤 Nome do usuário da app (padrão: app_user): " APP_USER
APP_USER=${APP_USER:-app_user}
read -p "🔐 Senha do usuário da app: " -s APP_PASSWORD
echo ""
read -p "📊 Nome do banco (padrão: azure_site): " DB_NAME
DB_NAME=${DB_NAME:-azure_site}

echo ""
echo "🔧 Criando usuário e banco..."

# Criar usuário e banco
PGPASSWORD=$POSTGRES_PASSWORD psql -U postgres -d postgres << EOF
-- Criar usuário
CREATE USER $APP_USER WITH PASSWORD '$APP_PASSWORD';

-- Criar banco
CREATE DATABASE $DB_NAME OWNER $APP_USER;

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $APP_USER;

-- Conectar ao banco e dar permissões no schema
\c $DB_NAME
GRANT ALL ON SCHEMA public TO $APP_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $APP_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $APP_USER;

-- Definir permissões padrão para futuras tabelas
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $APP_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $APP_USER;

SELECT 'Usuário criado com sucesso!' as status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Usuário criado com sucesso!"
    echo ""
    echo "📋 Informações:"
    echo "   Usuário: $APP_USER"
    echo "   Senha: $APP_PASSWORD"
    echo "   Banco: $DB_NAME"
    echo ""
    echo "🧪 Teste:"
    echo "   psql -h localhost -U $APP_USER -d $DB_NAME"
else
    echo "❌ Erro ao criar usuário"
fi
