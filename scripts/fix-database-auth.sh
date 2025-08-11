#!/bin/bash

echo "🔧 Corrigindo autenticação do banco de dados..."
echo "=============================================="

cd /var/www/azure-site

# 1. Verificar arquivo .env.local atual
echo "1. Verificando configurações atuais..."
if [ -f ".env.local" ]; then
    echo "Configurações encontradas:"
    grep -E "^DB_" .env.local | sed 's/DB_PASSWORD=.*/DB_PASSWORD=***/'
else
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

# 2. Testar conexão direta
echo ""
echo "2. Testando conexão direta com o banco..."
DB_HOST=$(grep "^DB_HOST=" .env.local | cut -d'=' -f2)
DB_PORT=$(grep "^DB_PORT=" .env.local | cut -d'=' -f2)
DB_NAME=$(grep "^DB_NAME=" .env.local | cut -d'=' -f2)
DB_USER=$(grep "^DB_USER=" .env.local | cut -d'=' -f2)
DB_PASSWORD=$(grep "^DB_PASSWORD=" .env.local | cut -d'=' -f2)

echo "Testando: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"

# Testar conexão
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT current_user, current_database();" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Conexão direta funciona!"
else
    echo "❌ Conexão direta falha!"
    echo "Vamos reconfigurar as credenciais..."
    
    # Solicitar novas credenciais
    read -p "🔗 IP da VM do banco (atual: $DB_HOST): " NEW_DB_HOST
    NEW_DB_HOST=${NEW_DB_HOST:-$DB_HOST}
    
    read -p "👤 Usuário do banco (atual: $DB_USER): " NEW_DB_USER
    NEW_DB_USER=${NEW_DB_USER:-$DB_USER}
    
    read -s -p "🔐 Nova senha do banco: " NEW_DB_PASSWORD
    echo ""
    
    # Testar novas credenciais
    PGPASSWORD=$NEW_DB_PASSWORD psql -h $NEW_DB_HOST -p $DB_PORT -U $NEW_DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Novas credenciais funcionam!"
        
        # Atualizar .env.local
        sed -i "s/^DB_HOST=.*/DB_HOST=$NEW_DB_HOST/" .env.local
        sed -i "s/^DB_USER=.*/DB_USER=$NEW_DB_USER/" .env.local
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_DB_PASSWORD/" .env.local
        
        DB_HOST=$NEW_DB_HOST
        DB_USER=$NEW_DB_USER
        DB_PASSWORD=$NEW_DB_PASSWORD
        
        echo "✅ Arquivo .env.local atualizado"
    else
        echo "❌ Novas credenciais também não funcionam!"
        exit 1
    fi
fi

# 3. Verificar se as tabelas existem e têm as permissões corretas
echo ""
echo "3. Verificando tabelas e permissões..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Verificar se a tabela users existe
\dt users

-- Verificar permissões na tabela users
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='users' AND grantee='$DB_USER';

-- Testar inserção simples
INSERT INTO users (name, email, password_hash) 
VALUES ('Teste Permissao', 'teste.permissao@exemplo.com', 'hash_teste') 
ON CONFLICT (email) DO NOTHING;

-- Verificar se inseriu
SELECT id, name, email FROM users WHERE email = 'teste.permissao@exemplo.com';

-- Limpar teste
DELETE FROM users WHERE email = 'teste.permissao@exemplo.com';
EOF

if [ $? -eq 0 ]; then
    echo "✅ Tabelas e permissões OK!"
else
    echo "❌ Problema com tabelas ou permissões!"
    
    # Tentar corrigir permissões
    echo "Tentando corrigir permissões..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Garantir permissões na tabela users
GRANT ALL PRIVILEGES ON TABLE users TO $DB_USER;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO $DB_USER;

-- Verificar novamente
SELECT 'Permissões atualizadas' as status;
EOF
fi

# 4. Parar aplicação e rebuild
echo ""
echo "4. Reiniciando aplicação..."
pm2 stop azure-site

# Rebuild
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 5. Reiniciar aplicação
pm2 start azure-site
sleep 5

# 6. Teste final com logs detalhados
echo ""
echo "5. Teste final..."

# Monitorar logs em background
pm2 logs azure-site --lines 0 &
LOGS_PID=$!

sleep 2

# Fazer teste de registro
echo "Testando registro..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Final",
    "email": "teste.final@exemplo.com",
    "password": "123456"
  }')

echo "Resposta: $REGISTER_RESPONSE"

# Parar logs
sleep 3
kill $LOGS_PID 2>/dev/null || true

# Verificar se o usuário foi criado no banco
echo ""
echo "6. Verificando se usuário foi criado no banco..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, name, email FROM users WHERE email = 'teste.final@exemplo.com';"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ TESTE DE AUTENTICAÇÃO CONCLUÍDO!"
echo "🎉 ======================================="
echo ""
echo "🌐 Teste no navegador: http://$PUBLIC_IP/register"
echo "🗄️ Banco: $DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "🔧 Para monitorar: pm2 logs azure-site"
