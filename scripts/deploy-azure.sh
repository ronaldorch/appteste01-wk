#!/bin/bash

# Script de deploy completo para Azure Linux VM
# Execute este script na sua instância Azure Linux

echo "🚀 Iniciando deploy completo do site no Azure Linux..."

# Verificar se é executado como usuário com sudo
if [ "$EUID" -eq 0 ]; then 
    echo "❌ Não execute este script como root. Use um usuário com privilégios sudo."
    exit 1
fi

# Atualizar sistema
echo "📦 Atualizando sistema..."
sudo apt update && sudo apt upgrade -y

# Instalar dependências do sistema
echo "🔧 Instalando dependências do sistema..."
sudo apt-get install -y curl wget git unzip software-properties-common

# Instalar Node.js 18.x e npm
echo "📦 Instalando Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalação do Node.js
echo "✅ Node.js versão: $(node --version)"
echo "✅ NPM versão: $(npm --version)"

# Instalar PM2 globalmente para gerenciamento de processos
echo "🔄 Instalando PM2..."
sudo npm install -g pm2

# Instalar Docker e Docker Compose (opcional)
echo "🐳 Instalando Docker..."
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Criar diretório para a aplicação
echo "📁 Criando diretório da aplicação..."
sudo mkdir -p /var/www/azure-site
sudo chown -R $USER:$USER /var/www/azure-site
cd /var/www/azure-site

# Se os arquivos não estiverem aqui, você precisa copiá-los
# Exemplo: scp -r ./projeto/* usuario@ip-azure:/var/www/azure-site/
echo "📋 IMPORTANTE: Certifique-se de que os arquivos do projeto estão em /var/www/azure-site/"
echo "   Você pode usar: scp -r ./projeto/* usuario@ip-azure:/var/www/azure-site/"

# Verificar se package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Arquivo package.json não encontrado!"
    echo "   Copie os arquivos do projeto para /var/www/azure-site/ primeiro"
    exit 1
fi

# Instalar dependências do projeto
echo "📦 Instalando dependências do Node.js..."
npm install

# Verificar se a instalação foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Dependências instaladas com sucesso!"
else
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

# Build da aplicação Next.js
echo "🏗️ Fazendo build da aplicação..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build da aplicação!"
    exit 1
fi

# Parar processo anterior se existir
echo "🔄 Parando processos anteriores..."
pm2 stop azure-site 2>/dev/null || true
pm2 delete azure-site 2>/dev/null || true

# Iniciar aplicação com PM2
echo "🚀 Iniciando aplicação com PM2..."
pm2 start npm --name "azure-site" -- start

# Configurar PM2 para iniciar automaticamente
echo "⚙️ Configurando inicialização automática..."
pm2 startup
pm2 save

# Instalar e configurar Nginx
echo "🌐 Instalando e configurando Nginx..."
sudo apt install -y nginx

# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/azure-site > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Ativar site no Nginx
sudo ln -sf /etc/nginx/sites-available/azure-site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx
sudo systemctl enable nginx

# Configurar firewall
echo "🔒 Configurando firewall..."
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Aplicação direta
sudo ufw --force enable

# Verificar status dos serviços
echo "🔍 Verificando status dos serviços..."
echo "PM2 Status:"
pm2 status

echo "Nginx Status:"
sudo systemctl status nginx --no-pager -l

echo "Docker Status:"
sudo systemctl status docker --no-pager -l

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP não detectado")

echo ""
echo "🎉 =================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "🎉 =================================="
echo ""
echo "🌐 Site disponível em:"
echo "   Via Nginx: http://$PUBLIC_IP"
echo "   Direto:    http://$PUBLIC_IP:3000"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo "   OU"
echo "   Email: admin@sistema.com"
echo "   Senha: admin123"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status           # Ver status da aplicação"
echo "   pm2 logs azure-site  # Ver logs da aplicação"
echo "   pm2 restart azure-site # Reiniciar aplicação"
echo "   sudo systemctl status nginx # Status do Nginx"
echo ""
echo "📁 Arquivos em: /var/www/azure-site"
echo "🔄 Para atualizar: cd /var/www/azure-site && git pull && npm run build && pm2 restart azure-site"
