#!/bin/bash

echo "🔧 Desabilitando banco de dados temporariamente..."
echo "================================================"

cd /var/www/azure-site

# 1. Parar aplicação
echo "1. Parando aplicação..."
pm2 stop azure-site

# 2. Modificar .env.local para desabilitar banco
echo "2. Desabilitando banco no .env.local..."
if [ -f ".env.local" ]; then
    # Comentar configurações do banco
    sed -i 's/^DB_HOST=/#DB_HOST=/' .env.local
    sed -i 's/^DB_PORT=/#DB_PORT=/' .env.local
    sed -i 's/^DB_NAME=/#DB_NAME=/' .env.local
    sed -i 's/^DB_USER=/#DB_USER=/' .env.local
    sed -i 's/^DB_PASSWORD=/#DB_PASSWORD=/' .env.local
    sed -i 's/^DB_SSL=/#DB_SSL=/' .env.local
    
    echo "✅ Configurações do banco comentadas"
else
    echo "⚠️ Arquivo .env.local não encontrado, criando novo..."
    cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do banco (desabilitadas)
# DB_HOST=IP_DA_VM_BANCO
# DB_PORT=5432
# DB_NAME=azure_site
# DB_USER=app_user
# DB_PASSWORD=sua_senha
# DB_SSL=false
EOF
    chmod 600 .env.local
fi

# 3. Rebuild da aplicação
echo "3. Fazendo rebuild..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 4. Testar aplicação
echo "4. Testando aplicação..."
timeout 15s npm start &
APP_PID=$!
sleep 8

# Testar registro
echo "Testando registro..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "123456"
  }')

echo "Resposta: $REGISTER_RESPONSE"

# Testar login
echo "Testando login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@exemplo.com",
    "password": "123456"
  }')

echo "Resposta: $LOGIN_RESPONSE"

# Parar teste
kill $APP_PID 2>/dev/null || true

# 5. Reiniciar com PM2
echo "5. Reiniciando com PM2..."
pm2 start azure-site
sleep 5

# 6. Teste final
echo "6. Teste final..."
FINAL_REGISTER=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ronaldo dos Santos Rocha",
    "email": "ron29a@gmail.com",
    "password": "123456"
  }')

echo "Registro final: $FINAL_REGISTER"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 =================================="
echo "✅ BANCO DESABILITADO COM SUCESSO!"
echo "🎉 =================================="
echo ""
echo "🌐 Teste agora: http://$PUBLIC_IP/register"
echo "💾 Usando dados em memória (não persistente)"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "🔧 Para reabilitar banco depois:"
echo "   ./scripts/setup-database-connection.sh"
