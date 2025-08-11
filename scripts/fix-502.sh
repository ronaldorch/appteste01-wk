#!/bin/bash

echo "🔧 Corrigindo erro 502 Bad Gateway..."
echo "===================================="

cd /var/www/azure-site

# 1. Parar todos os processos
echo "1. Parando processos..."
pm2 stop all
pm2 delete all
sudo systemctl stop nginx

# 2. Verificar se não há processos Node.js órfãos
echo "2. Limpando processos órfãos..."
sudo pkill -f node || true
sudo pkill -f next || true

# 3. Limpar cache do Next.js
echo "3. Limpando cache..."
rm -rf .next/
rm -rf node_modules/.cache/

# 4. Reinstalar dependências se necessário
echo "4. Verificando dependências..."
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo "Reinstalando dependências..."
    rm -rf node_modules package-lock.json
    npm install
fi

# 5. Rebuild da aplicação
echo "5. Fazendo rebuild..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Verificando problemas..."
    
    # Verificar se há erros de TypeScript
    echo "Verificando erros de TypeScript..."
    npx tsc --noEmit || true
    
    # Verificar se há problemas com dependências
    echo "Verificando dependências..."
    npm audit || true
    
    exit 1
fi

# 6. Configurar variáveis de ambiente se não existir
if [ ! -f ".env.local" ]; then
    echo "6. Criando arquivo .env.local básico..."
    cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
EOF
fi

# 7. Testar a aplicação antes de iniciar com PM2
echo "7. Testando aplicação..."
timeout 10s npm start &
APP_PID=$!
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona corretamente"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação não responde. Verificando logs..."
    kill $APP_PID 2>/dev/null || true
    
    # Tentar iniciar em modo desenvolvimento para ver erros
    echo "Iniciando em modo dev para debug..."
    timeout 10s npm run dev &
    DEV_PID=$!
    sleep 5
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

# 8. Iniciar com PM2
echo "8. Iniciando com PM2..."
pm2 start npm --name "azure-site" -- start

# Aguardar a aplicação inicializar
sleep 5

# Verificar se PM2 está rodando
if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 iniciado com sucesso"
else
    echo "❌ Erro ao iniciar com PM2"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 9. Testar aplicação via PM2
echo "9. Testando aplicação via PM2..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação responde via PM2"
else
    echo "❌ Aplicação não responde via PM2"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 10. Reconfigurar Nginx
echo "10. Reconfigurando Nginx..."
sudo tee /etc/nginx/sites-available/azure-site > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs específicos
    access_log /var/log/nginx/azure-site.access.log;
    error_log /var/log/nginx/azure-site.error.log;

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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
echo "11. Testando configuração do Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do Nginx OK"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# 12. Iniciar Nginx
echo "12. Iniciando Nginx..."
sudo systemctl start nginx
sudo systemctl enable nginx

# 13. Teste final
echo "13. Teste final..."
sleep 3

# Testar via Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx funcionando corretamente"
else
    echo "❌ Nginx não está funcionando"
    sudo tail -10 /var/log/nginx/error.log
    exit 1
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP não detectado")

echo ""
echo "🎉 =================================="
echo "✅ ERRO 502 CORRIGIDO!"
echo "🎉 =================================="
echo ""
echo "🌐 Site disponível em:"
echo "   http://$PUBLIC_IP"
echo "   http://localhost (local)"
echo ""
echo "🔧 Para monitorar:"
echo "   pm2 status"
echo "   pm2 logs azure-site"
echo "   sudo tail -f /var/log/nginx/azure-site.error.log"
echo ""
