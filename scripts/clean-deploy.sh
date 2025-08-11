#!/bin/bash

echo "🚀 Deploy Limpo Completo - Azure VM"
echo "===================================="

# Verificar se é executado como usuário correto
if [ "$EUID" -eq 0 ]; then 
    echo "❌ Não execute como root. Use um usuário com sudo."
    exit 1
fi

# Definir variáveis
APP_DIR="/var/www/azure-site"
BACKUP_DIR="/var/backups/azure-site-$(date +%Y%m%d-%H%M%S)"

echo "📋 Configurações:"
echo "   Diretório da aplicação: $APP_DIR"
echo "   Backup será salvo em: $BACKUP_DIR"
echo ""

# 1. Parar todos os serviços
echo "1. Parando serviços existentes..."
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true
sudo systemctl stop nginx 2>/dev/null || true

# 2. Fazer backup se existir aplicação anterior
if [ -d "$APP_DIR" ]; then
    echo "2. Fazendo backup da aplicação anterior..."
    sudo mkdir -p /var/backups
    sudo cp -r "$APP_DIR" "$BACKUP_DIR" 2>/dev/null || true
    echo "✅ Backup salvo em: $BACKUP_DIR"
else
    echo "2. Nenhuma aplicação anterior encontrada"
fi

# 3. Remover aplicação anterior
echo "3. Removendo aplicação anterior..."
sudo rm -rf "$APP_DIR"
sudo mkdir -p "$APP_DIR"
sudo chown -R $USER:$USER "$APP_DIR"

# 4. Atualizar sistema
echo "4. Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# 5. Instalar dependências do sistema
echo "5. Instalando dependências do sistema..."
sudo apt install -y curl wget git unzip software-properties-common nginx

# 6. Instalar Node.js 18.x
echo "6. Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"

# 7. Instalar PM2
echo "7. Instalando PM2..."
sudo npm install -g pm2@latest

# 8. Configurar diretório da aplicação
echo "8. Configurando diretório..."
cd "$APP_DIR"

echo ""
echo "🔄 AGORA VOCÊ PRECISA COPIAR OS ARQUIVOS DO PROJETO!"
echo "=================================================="
echo ""
echo "Execute um dos comandos abaixo no seu computador local:"
echo ""
echo "Opção 1 - SCP (se você tem os arquivos localmente):"
echo "scp -r ./projeto/* usuario@20.206.241.250:$APP_DIR/"
echo ""
echo "Opção 2 - Git Clone (se está no GitHub):"
echo "git clone https://github.com/seu-usuario/seu-repo.git $APP_DIR"
echo ""
echo "Opção 3 - Rsync (mais eficiente):"
echo "rsync -avz --progress ./projeto/ usuario@20.206.241.250:$APP_DIR/"
echo ""
echo "Pressione ENTER quando terminar de copiar os arquivos..."
read -p ""

# Verificar se os arquivos foram copiados
if [ ! -f "package.json" ]; then
    echo "❌ Arquivo package.json não encontrado!"
    echo "   Certifique-se de copiar todos os arquivos do projeto"
    exit 1
fi

echo "✅ Arquivos do projeto encontrados!"

# 9. Instalar dependências do projeto
echo "9. Instalando dependências do Node.js..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências!"
    echo "Tentando limpar cache e reinstalar..."
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ Falha crítica na instalação de dependências!"
        exit 1
    fi
fi

# 10. Criar arquivo de ambiente
echo "10. Configurando variáveis de ambiente..."
cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do banco (descomente quando configurar)
# DB_HOST=IP_DO_BANCO
# DB_PORT=5432
# DB_NAME=azure_site
# DB_USER=app_user
# DB_PASSWORD=sua_senha
# DB_SSL=false
EOF

chmod 600 .env.local
echo "✅ Arquivo .env.local criado"

# 11. Build da aplicação
echo "11. Fazendo build da aplicação..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build!"
    echo "Verificando problemas..."
    
    # Tentar corrigir problemas comuns
    echo "Limpando cache..."
    rm -rf .next node_modules/.cache
    
    echo "Tentando build novamente..."
    npm run build
    
    if [ $? -ne 0 ]; then
        echo "❌ Build falhou novamente!"
        echo "Verifique os logs acima para erros específicos"
        exit 1
    fi
fi

echo "✅ Build concluído com sucesso!"

# 12. Testar aplicação
echo "12. Testando aplicação..."
timeout 15s npm start &
APP_PID=$!
sleep 8

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona corretamente"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação não responde"
    kill $APP_PID 2>/dev/null || true
    echo "Verificando logs..."
    npm start &
    sleep 5
    kill $! 2>/dev/null || true
    exit 1
fi

# 13. Configurar PM2
echo "13. Configurando PM2..."
pm2 start npm --name "azure-site" -- start
sleep 5

if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 configurado com sucesso"
else
    echo "❌ Erro no PM2"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 14. Configurar Nginx
echo "14. Configurando Nginx..."
sudo tee /etc/nginx/sites-available/azure-site > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    # Logs
    access_log /var/log/nginx/azure-site.access.log;
    error_log /var/log/nginx/azure-site.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

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

    # Static files
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
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
    add_header X-Robots-Tag "noindex, nofollow" always;
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    echo "✅ Nginx configurado com sucesso"
else
    echo "❌ Erro na configuração do Nginx"
    sudo nginx -t
    exit 1
fi

# 15. Configurar firewall
echo "15. Configurando firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# 16. Configurar PM2 para inicialização automática
echo "16. Configurando inicialização automática..."
pm2 startup
pm2 save

# 17. Teste final completo
echo "17. Executando testes finais..."
sleep 5

# Testar aplicação direta
echo "Testando aplicação (porta 3000)..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação (porta 3000): OK"
else
    echo "❌ Aplicação (porta 3000): ERRO"
    pm2 logs azure-site --lines 5
fi

# Testar via Nginx
echo "Testando Nginx (porta 80)..."
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx (porta 80): OK"
else
    echo "❌ Nginx (porta 80): ERRO"
    sudo tail -5 /var/log/nginx/error.log
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "20.206.241.250")

echo ""
echo "🎉 ========================================="
echo "✅ DEPLOY LIMPO CONCLUÍDO COM SUCESSO!"
echo "🎉 ========================================="
echo ""
echo "🌐 Acesse sua aplicação:"
echo "   http://$PUBLIC_IP"
echo "   http://20.206.241.250"
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
echo "   $APP_DIR/.env.local              # Configurações"
echo "   /var/log/nginx/azure-site.*.log  # Logs do Nginx"
echo "   ~/.pm2/logs/azure-site-*.log     # Logs do PM2"
echo ""
echo "🗄️ Para configurar banco PostgreSQL:"
echo "   ./scripts/setup-database-connection.sh"
echo ""
echo "💾 Backup da aplicação anterior:"
echo "   $BACKUP_DIR"
echo ""
