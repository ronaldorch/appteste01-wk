#!/bin/bash

echo "🔧 Corrigindo problema do PM2..."
echo "==============================="

cd /var/www/azure-site

# 1. Limpar todos os processos PM2
echo "1. Limpando processos PM2..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

# 2. Verificar se a aplicação funciona manualmente
echo "2. Testando aplicação manualmente..."
timeout 10s npm start &
APP_PID=$!
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona corretamente"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação não funciona"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# 3. Iniciar com PM2 usando método correto
echo "3. Iniciando com PM2..."
pm2 start npm --name "azure-site" -- start

# Aguardar inicialização
sleep 5

# 4. Verificar se PM2 está funcionando
echo "4. Verificando PM2..."
pm2 status

if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 funcionando corretamente!"
else
    echo "❌ PM2 ainda com problema, tentando método alternativo..."
    
    # Método alternativo: usar ecosystem.config.js
    if [ -f "ecosystem.config.js" ]; then
        echo "Usando ecosystem.config.js..."
        pm2 start ecosystem.config.js
        sleep 3
    else
        echo "Criando ecosystem.config.js..."
        cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "azure-site",
      script: "npm",
      args: "start",
      cwd: "/var/www/azure-site",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
}
EOF
        pm2 start ecosystem.config.js
        sleep 3
    fi
fi

# 5. Teste final
echo "5. Teste final..."
sleep 3

# Testar aplicação
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação (porta 3000): OK"
else
    echo "❌ Aplicação (porta 3000): ERRO"
    pm2 logs azure-site --lines 5
fi

# Testar via Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx (porta 80): OK"
else
    echo "❌ Nginx (porta 80): ERRO"
    sudo systemctl restart nginx
    sleep 3
    if curl -f http://localhost > /dev/null 2>&1; then
        echo "✅ Nginx reiniciado e funcionando!"
    fi
fi

# 6. Salvar configuração PM2
echo "6. Salvando configuração PM2..."
pm2 save
pm2 startup

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

echo ""
echo "🎉 ======================================="
echo "✅ PM2 CORRIGIDO E APLICAÇÃO FUNCIONANDO!"
echo "🎉 ======================================="
echo ""
echo "🛍️ Acesse sua loja:"
echo "   Dashboard: http://$PUBLIC_IP/dashboard"
echo "   Produtos:  http://$PUBLIC_IP/dashboard/products"
echo "   Pedidos:   http://$PUBLIC_IP/dashboard/orders"
echo ""
echo "📋 Credenciais:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status"
echo "   pm2 logs azure-site"
echo "   pm2 restart azure-site"
