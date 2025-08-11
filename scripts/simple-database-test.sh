#!/bin/bash

echo "🧪 Teste simples de conexão com banco..."
echo "======================================="

cd /var/www/azure-site

# Carregar variáveis
export $(grep -v '^#' .env.local | xargs)

echo "📋 Testando com as credenciais do .env.local:"
echo "   Host: $DB_HOST"
echo "   User: $DB_USER"
echo "   Database: $DB_NAME"

# Teste direto
echo ""
echo "1. Teste direto via psql:"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    current_user as usuario_atual,
    current_database() as banco_atual,
    version() as versao_postgres;
"

if [ $? -eq 0 ]; then
    echo "✅ Conexão direta OK"
else
    echo "❌ Conexão direta falhou"
    exit 1
fi

# Teste via Node.js
echo ""
echo "2. Teste via Node.js:"
node -e "
const { Pool } = require('pg');

const pool = new Pool({
  host: '$DB_HOST',
  port: $DB_PORT,
  database: '$DB_NAME',
  user: '$DB_USER',
  password: '$DB_PASSWORD',
  ssl: false,
});

pool.query('SELECT current_user, current_database()')
  .then(result => {
    console.log('✅ Node.js connection OK:', result.rows[0]);
    return pool.query('SELECT COUNT(*) as total FROM users');
  })
  .then(result => {
    console.log('✅ Users table accessible, total users:', result.rows[0].total);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Node.js connection failed:', error.message);
    process.exit(1);
  });
"

echo ""
echo "✅ Teste simples concluído!"
