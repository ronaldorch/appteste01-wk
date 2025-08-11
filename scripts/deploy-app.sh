#!/bin/bash

echo "📦 DEPLOY DA APLICAÇÃO"
echo "====================="
echo ""

APP_DIR="/var/www/azure-site"

# Verificar se o diretório existe
if [ ! -d "$APP_DIR" ]; then
    echo "❌ Diretório $APP_DIR não existe!"
    echo "Execute primeiro: ./scripts/fresh-install.sh"
    exit 1
fi

cd "$APP_DIR"

# Verificar se os arquivos foram copiados
if [ ! -f "package.json" ]; then
    echo "❌ Arquivos da aplicação não encontrados!"
    echo ""
    echo "Copie os arquivos primeiro:"
    echo "scp -r ./seu-projeto/* usuario@20.206.241.250:/var/www/azure-site/"
    echo ""
    exit 1
fi

echo "✅ Arquivos encontrados em $APP_DIR"

# 1. Instalar dependências
echo "1. Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

# 2. Criar arquivo de ambiente
echo "2. Criando arquivo de ambiente..."
if [ ! -f ".env.local" ]; then
    cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do banco (configure quando necessário)
# DB_HOST=seu_host
# DB_PORT=5432
# DB_NAME=azure_site
# DB_USER=app_user
# DB_PASSWORD=sua_senha
# DB_SSL=false
EOF
    chmod 600 .env.local
    echo "✅ Arquivo .env.local criado"
else
    echo "✅ Arquivo .env.local já existe"
fi

# 3. Build da aplicação
echo "3. Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    echo "Tentando limpar cache e fazer build novamente..."
    rm -rf .next node_modules/.cache
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build falhou!"
        exit 1
    fi
fi

echo "✅ Build concluído!"

# 4. Testar aplicação
echo "4. Testando aplicação..."
timeout 10s npm start &
TEST_PID=$!
sleep 5

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona!"
    kill $TEST_PID 2>/dev/null || true
else
    echo "❌ Aplicação não responde!"
    kill $TEST_PID 2>/dev/null || true
    exit 1
fi

# 5. Configurar PM2
echo "5. Configurando PM2..."
pm2 delete azure-site 2>/dev/null || true
pm2 start npm --name "azure-site" -- start

sleep 3

if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 configurado!"
else
    echo "❌ Erro no PM2!"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 6. Configurar Nginx
echo "6. Configurando Nginx..."
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

# Ativar site
sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar e reiniciar Nginx
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✅ Nginx configurado!"
else
    echo "❌ Erro na configuração do Nginx!"
    exit 1
fi

# 7. Configurar inicialização automática
echo "7. Configurando inicialização automática..."
pm2 startup
pm2 save

# 8. Teste final
echo "8. Teste final..."
sleep 3

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Site funcionando!"
else
    echo "❌ Site não responde!"
    echo "Verificando logs..."
    pm2 logs azure-site --lines 5
    sudo tail -5 /var/log/nginx/error.log
    exit 1
fi

echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo "==============================="
echo ""
echo "🌐 Acesse: http://20.206.241.250"
echo ""
echo "📋 Comandos úteis:"
echo "pm2 status"
echo "pm2 logs azure-site"
echo "pm2 restart azure-site"
echo ""
