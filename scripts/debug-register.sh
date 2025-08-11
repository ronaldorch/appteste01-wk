#!/bin/bash

echo "🔍 Diagnosticando erro de registro..."
echo "==================================="

cd /var/www/azure-site

# 1. Verificar logs do PM2
echo "1. Logs recentes do PM2:"
pm2 logs azure-site --lines 20

echo ""
echo "2. Testando API de registro manualmente:"

# Testar API de registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste Usuario",
    "email": "teste@exemplo.com",
    "password": "123456"
  }' \
  -v

echo ""
echo "3. Verificando se a rota existe:"
ls -la app/api/auth/register/

echo ""
echo "4. Verificando configuração do Next.js:"
cat next.config.mjs 2>/dev/null || echo "next.config.mjs não encontrado"

echo ""
echo "5. Verificando variáveis de ambiente:"
if [ -f ".env.local" ]; then
    echo "Arquivo .env.local existe"
    grep -E "^[A-Z]" .env.local | cut -d'=' -f1
else
    echo "Arquivo .env.local não encontrado"
fi
