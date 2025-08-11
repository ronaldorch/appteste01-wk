#!/bin/bash

echo "🚀 Finalizando configuração da aplicação..."
echo "=========================================="

cd /var/www/azure-site

# 1. Parar processos atuais
echo "1. Parando processos..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 2. Build da aplicação
echo "2. Fazendo build final..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    exit 1
fi

# 3. Criar arquivo .env.local se não existir
if [ ! -f ".env.local" ]; then
    echo "3. Criando arquivo .env.local..."
    cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do banco (descomentadas quando configurar)
# DB_HOST=IP_DA_VM_BANCO
# DB_PORT=5432
# DB_NAME=azure_site
# DB_USER=app_user
# DB_PASSWORD=sua_senha
# DB_SSL=false
EOF
    chmod 600 .env.local
    echo "✅ Arquivo .env.local criado"
else
    echo "3. Arquivo .env.local já existe"
fi

# 4. Testar aplicação
echo "4. Testando aplicação..."
timeout 15s npm start &
APP_PID=$!
sleep 8

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona corretamente"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação não responde"
    kill $APP_PID 2>/dev/null || true
    exit 1
fi

# 5. Configurar PM2 com ecosystem.config.js
echo "5. Configurando PM2..."
pm2 start ecosystem.config.js
sleep 5

# Verificar se PM2 está funcionando
if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 configurado com sucesso"
else
    echo "❌ Erro no PM2, tentando método alternativo..."
    pm2 start npm --name "azure-site" -- start
    sleep 3
fi

# 6. Configurar Nginx
echo "6. Configurando Nginx..."
sudo tee /etc/nginx/sites-available/azure-site > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/azure-site.access.log;
    error_log /var/log/nginx/azure-site.error.log;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

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
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✅ Nginx configurado com sucesso"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# 7. Configurar PM2 para inicializar automaticamente
echo "7. Configurando inicialização automática..."
pm2 startup
pm2 save

# 8. Teste final completo
echo "8. Teste final..."
sleep 5

# Testar aplicação direta
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação (porta 3000): OK"
else
    echo "❌ Aplicação (porta 3000): ERRO"
fi

# Testar via Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx (porta 80): OK"
else
    echo "❌ Nginx (porta 80): ERRO"
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP não detectado")

echo ""
echo "🎉 ========================================="
echo "✅ APLICAÇÃO CONFIGURADA COM SUCESSO!"
echo "🎉 ========================================="
echo ""
echo "🌐 Acesse sua aplicação:"
echo "   http://$PUBLIC_IP"
echo "   http://localhost (local)"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo "   OU"
echo "   Email: admin@sistema.com"
echo "   Senha: admin123"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status                    # Status da aplicação"
echo "   pm2 logs azure-site          # Logs da aplicação"
echo "   pm2 restart azure-site       # Reiniciar aplicação"
echo "   sudo systemctl status nginx  # Status do Nginx"
echo "   curl http://localhost/health # Health check"
echo ""
echo "📁 Arquivos importantes:"
echo "   /var/www/azure-site/.env.local     # Configurações"
echo "   /var/log/nginx/azure-site.*.log    # Logs do Nginx"
echo "   ~/.pm2/logs/azure-site-*.log       # Logs do PM2"
echo ""
echo "🗄️ Para configurar banco PostgreSQL:"
echo "   ./scripts/setup-database-connection.sh"
echo ""
