#!/bin/bash

echo "🔍 TESTE DE CONECTIVIDADE COM VM-PRIVATE"
echo "========================================"
echo ""

# Solicitar informações
read -p "🔗 IP da vm-private: " DB_HOST
read -p "🔢 Porta (padrão 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "👤 Usuário (padrão postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

echo ""
echo "🔍 Testando conectividade básica..."

# Teste de ping
if ping -c 3 $DB_HOST > /dev/null 2>&1; then
    echo "✅ VM-private ($DB_HOST) está acessível"
else
    echo "❌ VM-private ($DB_HOST) não está acessível"
    exit 1
fi

# Teste de porta PostgreSQL
if nc -z $DB_HOST $DB_PORT 2>/dev/null; then
    echo "✅ Porta $DB_PORT está aberta"
else
    echo "❌ Porta $DB_PORT está fechada ou PostgreSQL não está rodando"
    exit 1
fi

echo ""
echo "🔐 Testando senhas comuns..."

# Lista de senhas para testar
PASSWORDS=("password" "postgres" "azure123" "app_password" "123456" "admin123")

for pwd in "${PASSWORDS[@]}"; do
    echo -n "   Testando '$pwd'... "
    if PGPASSWORD=$pwd psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c "SELECT 1;" > /dev/null 2>&1; then
        echo "✅ FUNCIONOU!"
        echo ""
        echo "🎉 SENHA ENCONTRADA: $pwd"
        echo "🔗 Conexão: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres"
        echo ""
        
        # Listar bancos disponíveis
        echo "📊 Bancos disponíveis:"
        PGPASSWORD=$pwd psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
        
        exit 0
    else
        echo "❌"
    fi
done

echo ""
echo "❌ Nenhuma senha comum funcionou."
echo ""
echo "🔧 Para resetar a senha na vm-private, execute:"
echo "   sudo -u postgres psql"
echo "   ALTER USER postgres PASSWORD 'nova_senha';"
echo "   \\q"
