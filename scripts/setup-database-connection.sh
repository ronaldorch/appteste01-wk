#!/bin/bash

echo "🗄️ Configurando conexão com banco de dados PostgreSQL..."
echo "======================================================="

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório da aplicação (/var/www/azure-site)"
    exit 1
fi

# Solicitar informações do banco
echo "📋 Informe os dados do banco PostgreSQL:"
read -p "🔗 IP da VM do banco de dados: " DB_HOST
read -p "🔢 Porta do PostgreSQL (padrão 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "📊 Nome do banco de dados: " DB_NAME
read -p "👤 Usuário do banco: " DB_USER
read -s -p "🔐 Senha do banco: " DB_PASSWORD
echo ""

# Testar conectividade básica
echo "🔍 Testando conectividade com a VM do banco..."
if ping -c 3 $DB_HOST > /dev/null 2>&1; then
    echo "✅ VM do banco está acessível"
else
    echo "❌ VM do banco não está acessível. Verifique:"
    echo "   - IP está correto?"
    echo "   - Firewall permite conexão?"
    echo "   - VMs estão na mesma rede?"
    exit 1
fi

# Instalar cliente PostgreSQL se necessário
if ! command -v psql > /dev/null 2>&1; then
    echo "📦 Instalando cliente PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql-client
fi

# Testar conexão PostgreSQL
echo "🔍 Testando conexão PostgreSQL..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Conexão PostgreSQL estabelecida com sucesso!"
else
    echo "❌ Erro na conexão PostgreSQL. Verifique:"
    echo "   - Usuário '$DB_USER' existe?"
    echo "   - Senha está correta?"
    echo "   - Banco '$DB_NAME' existe?"
    echo "   - PostgreSQL permite conexões remotas?"
    echo ""
    echo "🔧 Para configurar PostgreSQL na VM do banco:"
    echo "   sudo -u postgres createuser -P $DB_USER"
    echo "   sudo -u postgres createdb -O $DB_USER $DB_NAME"
    echo "   sudo nano /etc/postgresql/*/main/postgresql.conf"
    echo "   # Altere: listen_addresses = '*'"
    echo "   sudo nano /etc/postgresql/*/main/pg_hba.conf"
    echo "   # Adicione: host all all 10.0.0.0/8 md5"
    echo "   sudo systemctl restart postgresql"
    exit 1
fi

# Parar aplicação
echo "🔄 Parando aplicação..."
pm2 stop azure-site 2>/dev/null || true

# Atualizar arquivo .env.local
echo "📝 Atualizando configurações..."
cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do Banco de Dados
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false
EOF

chmod 600 .env.local
echo "✅ Arquivo .env.local atualizado"

# Executar script SQL de setup
echo "🗄️ Configurando tabelas do banco de dados..."
if [ -f "scripts/database-setup.sql" ]; then
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/database-setup.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Tabelas criadas/atualizadas com sucesso!"
    else
        echo "❌ Erro ao executar script SQL"
        exit 1
    fi
else
    echo "⚠️ Script database-setup.sql não encontrado, criando tabelas básicas..."
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Criar tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inserir usuários de teste
INSERT INTO users (name, email, password_hash) 
VALUES (
    'Usuário Demo',
    'demo@exemplo.com',
    '\$2a\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9S/EG'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (name, email, password_hash) 
VALUES (
    'Admin Sistema',
    'admin@sistema.com',
    '\$2a\$12\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
) ON CONFLICT (email) DO NOTHING;

SELECT 'Tabelas configuradas com sucesso!' as status;
EOF
fi

# Rebuild da aplicação
echo "🏗️ Fazendo rebuild da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# Reiniciar aplicação
echo "🚀 Reiniciando aplicação..."
pm2 start azure-site
sleep 5

# Teste final
echo "🔍 Testando conexão com banco..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Banco",
    "email": "teste.banco@exemplo.com",
    "password": "123456"
  }')

echo "Resposta do teste: $TEST_RESPONSE"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ BANCO DE DADOS CONFIGURADO!"
echo "🎉 ======================================="
echo ""
echo "🗄️ Banco: $DB_HOST:$DB_PORT/$DB_NAME"
echo "🌐 Site: http://$PUBLIC_IP"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "🔧 Para verificar logs: pm2 logs azure-site"
