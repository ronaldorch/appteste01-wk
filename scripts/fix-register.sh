#!/bin/bash

echo "🔧 Corrigindo erro de registro..."
echo "================================"

cd /var/www/azure-site

# 1. Parar aplicação
echo "1. Parando aplicação..."
pm2 stop azure-site

# 2. Rebuild com logs detalhados
echo "2. Fazendo rebuild..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 3. Testar API manualmente
echo "3. Testando API de registro..."
timeout 15s npm start &
APP_PID=$!
sleep 8

# Testar registro
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "123456"
  }')

echo "Resposta da API: $REGISTER_RESPONSE"

# Parar teste
kill $APP_PID 2>/dev/null || true

# 4. Reiniciar com PM2
echo "4. Reiniciando com PM2..."
pm2 start azure-site
sleep 5

# 5. Teste final
echo "5. Teste final da API..."
FINAL_TEST=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuario Final",
    "email": "final@exemplo.com", 
    "password": "123456"
  }')

echo "Teste final: $FINAL_TEST"

# 6. Verificar logs
echo "6. Logs recentes:"
pm2 logs azure-site --lines 10

echo ""
echo "✅ Correção concluída!"
echo "🌐 Teste no navegador: http://$(curl -s ifconfig.me)/register"
