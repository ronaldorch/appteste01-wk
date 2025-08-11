#!/bin/bash

echo "🗄️ Configurando banco de dados completo..."

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "📦 Instalando PostgreSQL..."
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Configurar usuário e banco
echo "👤 Configurando usuário e banco..."
sudo -u postgres psql << EOF
-- Criar usuário se não existir
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'Ronaldo123';
    END IF;
END
\$\$;

-- Alterar senha do usuário
ALTER USER postgres PASSWORD 'Ronaldo123';

-- Criar banco se não existir
SELECT 'CREATE DATABASE azure_site' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'azure_site')\gexec

-- Dar privilégios
GRANT ALL PRIVILEGES ON DATABASE azure_site TO postgres;
EOF

# Executar script de criação das tabelas
echo "🏗️ Criando estrutura do banco..."
sudo -u postgres psql -d azure_site -f /var/www/azure-site/scripts/cannabis-marketplace-complete.sql

# Testar conexão
echo "🔍 Testando conexão..."
sudo -u postgres psql -d azure_site -c "SELECT 'Conexão OK!' as status, NOW() as timestamp;"

echo "✅ Banco de dados configurado com sucesso!"
echo "📊 Estrutura criada:"
echo "   - Usuários e autenticação"
echo "   - Templates de genéticas"
echo "   - Produtos com estoque"
echo "   - Sistema de pedidos"
echo "   - Triggers automáticos"
