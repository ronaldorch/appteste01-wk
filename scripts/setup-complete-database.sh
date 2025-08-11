#!/bin/bash

echo "🗄️ Configurando banco de dados completo..."

# Configurações do banco
DB_HOST="10.0.2.4"
DB_PORT="5432"
DB_NAME="azure_site"
DB_USER="app_user"
DB_PASSWORD="sample123"

echo "📍 Conectando em: $DB_HOST:$DB_PORT"
echo "📍 Banco: $DB_NAME"
echo "📍 Usuário: $DB_USER"

# Testar conexão
echo "🔍 Testando conexão com o banco..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT version();" > /dev/null 2>&1; then
    echo "✅ Conexão com banco estabelecida!"
else
    echo "❌ Erro ao conectar com o banco!"
    echo "Verifique se:"
    echo "- A VM do banco está rodando"
    echo "- As credenciais estão corretas"
    echo "- O firewall permite conexões na porta 5432"
    exit 1
fi

# Executar script SQL
echo "📊 Executando script de criação das tabelas..."
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/cannabis-marketplace-complete.sql; then
    echo "✅ Tabelas criadas com sucesso!"
else
    echo "❌ Erro ao executar script SQL!"
    exit 1
fi

# Verificar tabelas criadas
echo "🔍 Verificando tabelas criadas..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
"

echo "📊 Contando registros..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    'genetic_templates' as tabela, COUNT(*) as registros FROM genetic_templates
UNION ALL
SELECT 
    'extraction_types' as tabela, COUNT(*) as registros FROM extraction_types
UNION ALL
SELECT 
    'categories' as tabela, COUNT(*) as registros FROM categories
UNION ALL
SELECT 
    'products' as tabela, COUNT(*) as registros FROM products;
"

echo ""
echo "✅ Configuração do banco concluída!"
echo "🌐 Agora você pode acessar:"
echo "   - Site: http://20.206.241.250"
echo "   - Admin: http://20.206.241.250/admin/templates"
echo ""
