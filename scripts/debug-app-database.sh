#!/bin/bash

echo "🔍 Debugando problema na aplicação..."
echo "===================================="

cd /var/www/azure-site

# 1. Verificar se as variáveis estão sendo carregadas corretamente
echo "1. Verificando carregamento de variáveis..."
pm2 stop azure-site

# Testar aplicação em modo debug
echo "Iniciando aplicação em modo debug..."
timeout 20s npm start &
APP_PID=$!
sleep 8

# Fazer requisição e capturar logs
echo ""
echo "2. Fazendo teste de registro..."
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Debug Test",
    "email": "debug@test.com",
    "password": "123456"
  }' \
  -v

# Parar aplicação de teste
kill $APP_PID 2>/dev/null || true
sleep 2

echo ""
echo "3. Verificando logs detalhados..."
pm2 start azure-site
sleep 5

# Monitorar logs em tempo real
pm2 logs azure-site --lines 0 &
LOGS_PID=$!

sleep 2

# Fazer novo teste
echo "Fazendo novo teste..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Final Debug",
    "email": "final.debug@test.com",
    "password": "123456"
  }')

echo "Resposta: $RESPONSE"

sleep 5
kill $LOGS_PID 2>/dev/null || true

echo ""
echo "4. Verificando se o problema é no hash da senha..."
# Testar diretamente no banco
export $(grep -v '^#' .env.local | xargs)

PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF
-- Tentar inserir com hash simples para teste
INSERT INTO users (name, email, password_hash) 
VALUES ('Teste Hash', 'teste.hash@exemplo.com', 'senha_simples_teste') 
ON CONFLICT (email) DO NOTHING;

-- Verificar se inseriu
SELECT id, name, email FROM users WHERE email = 'teste.hash@exemplo.com';
EOF

echo ""
echo "Debug concluído!"
