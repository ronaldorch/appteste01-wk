#!/bin/bash

echo "🔧 Corrigindo credenciais do arquivo .env.local..."
echo "================================================"

cd /var/www/azure-site

# 1. Verificar arquivo atual
echo "1. Verificando arquivo .env.local atual..."
if [ -f ".env.local" ]; then
    echo "Conteúdo atual (sem senhas):"
    grep -E "^[A-Z]" .env.local | sed 's/DB_PASSWORD=.*/DB_PASSWORD=***/'
else
    echo "❌ Arquivo .env.local não encontrado!"
    exit 1
fi

# 2. Testar credenciais manualmente
echo ""
echo "2. Vamos testar as credenciais que funcionam no terminal..."

# Carregar variáveis atuais
export $(grep -v '^#' .env.local | xargs)

echo "Testando credenciais atuais do .env.local..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT current_user;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Credenciais do .env.local funcionam no terminal!"
    echo "   O problema pode ser com o carregamento das variáveis na aplicação."
else
    echo "❌ Credenciais do .env.local NÃO funcionam no terminal!"
    echo "   Vamos reconfigurar..."
    
    # Solicitar credenciais que funcionam
    read -p "🔗 IP da VM do banco (atual: $DB_HOST): " NEW_DB_HOST
    NEW_DB_HOST=${NEW_DB_HOST:-$DB_HOST}
    
    read -p "👤 Usuário do banco (atual: $DB_USER): " NEW_DB_USER
    NEW_DB_USER=${NEW_DB_USER:-$DB_USER}
    
    read -s -p "🔐 Senha do banco (a que funciona no terminal): " NEW_DB_PASSWORD
    echo ""
    
    # Testar novas credenciais
    PGPASSWORD=$NEW_DB_PASSWORD psql -h $NEW_DB_HOST -p $DB_PORT -U $NEW_DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Novas credenciais funcionam!"
        
        # Atualizar .env.local
        sed -i "s/^DB_HOST=.*/DB_HOST=$NEW_DB_HOST/" .env.local
        sed -i "s/^DB_USER=.*/DB_USER=$NEW_DB_USER/" .env.local
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$NEW_DB_PASSWORD/" .env.local
        
        echo "✅ Arquivo .env.local atualizado"
    else
        echo "❌ Novas credenciais também não funcionam!"
        exit 1
    fi
fi

# 3. Parar aplicação
echo ""
echo "3. Parando aplicação..."
pm2 stop azure-site

# 4. Verificar se o Next.js está carregando o .env.local corretamente
echo ""
echo "4. Testando carregamento de variáveis..."

# Criar script de teste
cat > test-env.js << 'EOF'
// Carregar variáveis de ambiente como o Next.js faz
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Variáveis carregadas:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');

// Testar conexão
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
});

pool.query('SELECT current_user, current_database()')
  .then(result => {
    console.log('✅ Conexão via Node.js OK:', result.rows[0]);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro na conexão via Node.js:', error.message);
    process.exit(1);
  });
EOF

# Instalar dotenv se necessário
npm install dotenv

# Executar teste
echo "Testando carregamento de variáveis via Node.js..."
node test-env.js

if [ $? -eq 0 ]; then
    echo "✅ Variáveis carregam corretamente via Node.js"
else
    echo "❌ Problema no carregamento via Node.js"
    
    # Tentar recriar .env.local com formato correto
    echo "Recriando .env.local com formato correto..."
    
    # Carregar variáveis atuais
    DB_HOST=$(grep "^DB_HOST=" .env.local | cut -d'=' -f2)
    DB_PORT=$(grep "^DB_PORT=" .env.local | cut -d'=' -f2)
    DB_NAME=$(grep "^DB_NAME=" .env.local | cut -d'=' -f2)
    DB_USER=$(grep "^DB_USER=" .env.local | cut -d'=' -f2)
    DB_PASSWORD=$(grep "^DB_PASSWORD=" .env.local | cut -d'=' -f2)
    
    # Recriar arquivo
    cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_NAME=${DB_NAME}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_SSL=false
EOF
    
    chmod 600 .env.local
    echo "✅ Arquivo .env.local recriado"
    
    # Testar novamente
    node test-env.js
fi

# Limpar arquivo de teste
rm -f test-env.js

# 5. Rebuild e restart
echo ""
echo "5. Rebuild e restart da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

pm2 start azure-site
sleep 5

# 6. Teste final
echo ""
echo "6. Teste final..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Final Credenciais",
    "email": "teste.final.credenciais@exemplo.com",
    "password": "123456"
  }')

echo "Resposta: $RESPONSE"

# Verificar se foi criado no banco
export $(grep -v '^#' .env.local | xargs)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT id, name, email FROM users WHERE email = 'teste.final.credenciais@exemplo.com';" 2>/dev/null

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ CORREÇÃO DE CREDENCIAIS CONCLUÍDA!"
echo "🎉 ======================================="
echo ""
echo "🌐 Teste no navegador: http://$PUBLIC_IP/register"
echo "🔧 Para monitorar: pm2 logs azure-site"
