#!/bin/bash
echo "🚀 Deploy da aplicação do GitHub..."

# Configurações
GITHUB_REPO="https://github.com/ronaldorch/appteste01-wk.git"
APP_DIR="/var/www/azure-site"

# Clonar repositório
echo "📥 Clonando repositório..."
cd /var/www
sudo rm -rf azure-site
sudo git clone $GITHUB_REPO azure-site
sudo chown -R $USER:$USER $APP_DIR

# Entrar no diretório
cd $APP_DIR

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Criar arquivo de ambiente
echo "⚙️ Configurando ambiente..."
cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
DATABASE_URL=postgresql://postgres:Ronaldo123@localhost:5432/azure_site
EOF

# Build da aplicação
echo "🔨 Fazendo build..."
npm run build

# Configurar PM2
echo "🚀 Configurando PM2..."
pm2 delete azure-site 2>/dev/null || true
pm2 start npm --name "azure-site" -- start
pm2 save
pm2 startup

# Configurar Nginx
echo "🌐 Configurando Nginx..."
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

# Testar e reiniciar nginx
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deploy concluído!"
echo "🌐 Site disponível em: http://$(curl -s ifconfig.me)"
echo "📊 Status dos serviços:"
pm2 status
sudo systemctl status nginx --no-pager -l
