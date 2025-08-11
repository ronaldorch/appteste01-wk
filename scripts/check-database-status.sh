#!/bin/bash

echo "🔍 Verificando status completo do banco de dados..."
echo "=================================================="

cd /var/www/azure-site

# Carregar variáveis do .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

echo "📋 Configurações atuais:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Password: [HIDDEN]"
echo ""

# 1. Teste de conectividade
echo "1. 🔍 Testando conectividade..."
if ping -c 2 $DB_HOST > /dev/null 2>&1; then
    echo "   ✅ Host acessível"
else
    echo "   ❌ Host não acessível"
    exit 1
fi

# 2. Teste de porta
echo "2. 🔍 Testando porta PostgreSQL..."
if nc -zv $DB_HOST $DB_PORT 2>&1 | grep -q "succeeded"; then
    echo "   ✅ Porta $DB_PORT acessível"
else
    echo "   ❌ Porta $DB_PORT não acessível"
    exit 1
fi

# 3. Teste de autenticação
echo "3. 🔍 Testando autenticação..."
PGPASSWORD=$DB_PASSWORD psql --pset pager=off -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT current_user, version();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "   ✅ Autenticação OK"
else
    echo "   ❌ Falha na autenticação"
    echo "   Verifique usuário e senha no PostgreSQL"
    exit 1
fi

# 4. Verificar tabelas
echo "4. 🔍 Verificando estrutura do banco..."
PGPASSWORD=$DB_PASSWORD psql --pset pager=off -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
\echo '   📊 Tabelas existentes:'
\dt

\echo '   👥 Usuários na tabela:'
SELECT COUNT(*) as total_users FROM users;

\echo '   🔐 Últimos usuários criados:'
SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 3;
EOF

# 5. Teste de inserção
echo ""
echo "5. 🔍 Testando inserção de dados..."
PGPASSWORD=$DB_PASSWORD psql --pset pager=off -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Tentar inserir usuário de teste
INSERT INTO users (name, email, password_hash) 
VALUES ('Teste Conexao', 'teste.conexao@exemplo.com', 'hash_teste_123') 
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- Verificar se inseriu/atualizou
SELECT 'Teste de inserção OK' as status WHERE EXISTS (
    SELECT 1 FROM users WHERE email = 'teste.conexao@exemplo.com'
);

-- Limpar teste
DELETE FROM users WHERE email = 'teste.conexao@exemplo.com';
EOF

if [ $? -eq 0 ]; then
    echo "   ✅ Inserção/atualização OK"
else
    echo "   ❌ Problema com inserção"
fi

echo ""
echo "✅ Verificação completa do banco concluída!"
