#!/bin/bash

echo "🚀 Correção rápida do erro 502..."
echo "================================"

cd /var/www/azure-site

# 1. Instalar dependências do sistema
echo "1. Instalando dependências do sistema..."
sudo apt update
sudo apt install -y libpq-dev python3-dev build-essential postgresql-client

# 2. Parar processos
echo "2. Parando processos..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# 3. Backup do package.json atual
echo "3. Fazendo backup..."
cp package.json package.json.backup

# 4. Usar versão simplificada temporariamente
echo "4. Usando package.json simplificado..."
cp package-simple.json package.json

# 5. Limpar e reinstalar
echo "5. Limpando e reinstalando..."
rm -rf node_modules package-lock.json .next
npm cache clean --force
npm install

# 6. Build
echo "6. Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 7. Usar API simplificada temporariamente
echo "7. Configurando API simplificada..."
cp app/api/auth/login/route-simple.ts app/api/auth/login/route.ts

# 8. Testar aplicação
echo "8. Testando aplicação..."
timeout 10s npm start &
APP_PID=$!
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona!"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação ainda não funciona"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# 9. Iniciar com PM2
echo "9. Iniciando com PM2..."
pm2 start npm --name "azure-site" -- start
sleep 3

# 10. Configurar Nginx
echo "10. Configurando Nginx..."
sudo tee /etc/nginx/sites-available/azure-site > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl start nginx

# 11. Teste final
echo "11. Teste final..."
sleep 3

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")

if curl -f http://localhost > /dev/null 2>&1; then
    echo ""
    echo "🎉 =================================="
    echo "✅ APLICAÇÃO FUNCIONANDO!"
    echo "🎉 =================================="
    echo ""
    echo "🌐 Acesse: http://$PUBLIC_IP"
    echo "📋 Login: demo@exemplo.com / 123456"
    echo ""
    echo "⚠️ NOTA: Usando dados em memória (não persistente)"
    echo "   Para usar banco PostgreSQL, execute setup-database-connection.sh depois"
else
    echo "❌ Ainda há problemas. Verificando logs..."
    pm2 logs azure-site --lines 10
fi
