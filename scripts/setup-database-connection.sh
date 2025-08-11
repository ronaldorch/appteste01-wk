#!/bin/bash

echo "🗄️ Configurando conexão com banco de dados..."

# Verificar se as variáveis de ambiente estão definidas
if [ -z "$DB_HOST" ] || [ -z "$DB_USER" ] || [ -z "$DB_PASSWORD" ]; then
    echo "❌ Variáveis de ambiente do banco não configuradas"
    echo "Configure: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME"
    exit 1
fi

echo "📋 Configurações do banco:"
echo "   Host: $DB_HOST"
echo "   Porta: ${DB_PORT:-5432}"
echo "   Banco: ${DB_NAME:-azure_site}"
echo "   Usuário: $DB_USER"

# Testar conexão
echo "🔍 Testando conexão..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d ${DB_NAME:-azure_site} -c "SELECT NOW();" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexão com banco estabelecida com sucesso!"
    
    # Criar tabela de usuários se não existir
    echo "📋 Criando tabela de usuários..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p ${DB_PORT:-5432} -U $DB_USER -d ${DB_NAME:-azure_site} -c "
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );"
    
    echo "✅ Tabela de usuários configurada!"
else
    echo "❌ Erro ao conectar com o banco de dados"
    echo "Verifique as credenciais e se o banco está acessível"
    exit 1
fi
