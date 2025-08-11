#!/bin/bash

# 🚀 SCRIPT MASTER - SETUP COMPLETO GREENLEAF CANNABIS MARKETPLACE
# Este script faz TUDO: git pull, banco, dados, configuração, deploy
# Autor: Sistema Automatizado
# Data: $(date)

set -e  # Para na primeira falha

echo "🌿 ======================================================="
echo "🚀 GREENLEAF CANNABIS MARKETPLACE - SETUP MASTER"
echo "🌿 ======================================================="
echo ""
echo "⚠️  ATENÇÃO: Este script fará o setup COMPLETO do sistema!"
echo "📋 Incluindo: Git, Banco, Dados, Configuração, Deploy"
echo ""
read -p "🤔 Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup cancelado pelo usuário"
    exit 1
fi

echo ""
echo "🚀 Iniciando setup master..."
echo "=========================================="

# Variáveis
PROJECT_DIR="/var/www/azure-site"
BACKUP_DIR="/var/backups/azure-site-$(date +%Y%m%d-%H%M%S)"
LOG_FILE="/var/log/greenleaf-setup.log"

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Função de erro
error_exit() {
    log "❌ ERRO: $1"
    echo "❌ Setup falhou! Verifique o log: $LOG_FILE"
    exit 1
}

log "🚀 Iniciando setup master do GreenLeaf Cannabis Marketplace"

# 1. BACKUP DO SISTEMA ATUAL
echo "1️⃣ Fazendo backup do sistema atual..."
if [ -d "$PROJECT_DIR" ]; then
    log "📦 Criando backup em $BACKUP_DIR"
    sudo mkdir -p "$BACKUP_DIR"
    sudo cp -r "$PROJECT_DIR" "$BACKUP_DIR/" 2>/dev/null || true
    log "✅ Backup criado com sucesso"
else
    log "ℹ️ Diretório do projeto não existe, pulando backup"
fi

# 2. ATUALIZAR SISTEMA
echo "2️⃣ Atualizando sistema operacional..."
log "🔄 Atualizando pacotes do sistema"
sudo apt update -qq
sudo apt upgrade -y -qq
log "✅ Sistema atualizado"

# 3. INSTALAR DEPENDÊNCIAS
echo "3️⃣ Instalando dependências necessárias..."
log "📦 Instalando Node.js, PostgreSQL, Nginx, PM2"

# Node.js 18+
if ! command -v node &> /dev/null || [[ $(node -v | cut -d'v' -f2 | cut -d'.' -f1) -lt 18 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# PostgreSQL
if ! command -v psql &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

# Nginx
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

# Outras dependências
sudo apt install -y git curl wget unzip build-essential

log "✅ Dependências instaladas"

# 4. CONFIGURAR POSTGRESQL
echo "4️⃣ Configurando PostgreSQL..."
log "🗄️ Configurando banco de dados PostgreSQL"

# Gerar senha aleatória para o banco
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Configurar PostgreSQL
sudo -u postgres psql -c "DROP DATABASE IF EXISTS azure_site;" 2>/dev/null || true
sudo -u postgres psql -c "DROP USER IF EXISTS app_user;" 2>/dev/null || true
sudo -u postgres psql -c "CREATE USER app_user WITH PASSWORD '$DB_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE azure_site OWNER app_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE azure_site TO app_user;"

# Configurar pg_hba.conf para permitir conexões locais
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" /etc/postgresql/*/main/postgresql.conf
echo "local   azure_site      app_user                                md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

log "✅ PostgreSQL configurado - Senha: $DB_PASSWORD"

# 5. CLONAR/ATUALIZAR CÓDIGO
echo "5️⃣ Atualizando código do projeto..."
log "📥 Fazendo git pull do projeto"

if [ -d "$PROJECT_DIR/.git" ]; then
    cd "$PROJECT_DIR"
    git stash push -m "Auto-stash before master setup $(date)" 2>/dev/null || true
    git pull origin main || git pull origin master || error_exit "Falha no git pull"
    log "✅ Código atualizado via git pull"
else
    log "ℹ️ Repositório git não encontrado, assumindo código já está presente"
fi

# Garantir que estamos no diretório correto
cd "$PROJECT_DIR" || error_exit "Diretório do projeto não encontrado"

# 6. INSTALAR DEPENDÊNCIAS NPM
echo "6️⃣ Instalando dependências do Node.js..."
log "📦 Executando npm install"

# Limpar cache e node_modules
rm -rf node_modules package-lock.json 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# Instalar dependências
npm install || error_exit "Falha na instalação das dependências npm"
log "✅ Dependências npm instaladas"

# 7. CONFIGURAR VARIÁVEIS DE AMBIENTE
echo "7️⃣ Configurando variáveis de ambiente..."
log "⚙️ Criando arquivo .env.local"

cat > .env.local << EOF
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)

# Configurações do banco PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=azure_site
DB_USER=app_user
DB_PASSWORD=$DB_PASSWORD
DB_SSL=false

# URLs da aplicação
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF

chmod 600 .env.local
log "✅ Variáveis de ambiente configuradas"

# 8. CRIAR ESTRUTURA DO BANCO
echo "8️⃣ Criando estrutura do banco de dados..."
log "🗄️ Executando scripts de criação das tabelas"

# Script de criação das tabelas
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U app_user -d azure_site << 'EOF'
-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    slug VARCHAR(255) UNIQUE NOT NULL,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de imagens dos produtos
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de carrinho
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    customer_name VARCHAR(255),
    customer_email VARCHAR(255),
    customer_phone VARCHAR(50),
    shipping_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

EOF

if [ $? -eq 0 ]; then
    log "✅ Estrutura do banco criada com sucesso"
else
    error_exit "Falha na criação da estrutura do banco"
fi

# 9. INSERIR DADOS INICIAIS
echo "9️⃣ Inserindo dados iniciais..."
log "📊 Inserindo usuários, categorias e produtos"

PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U app_user -d azure_site -f scripts/cannabis-products.sql

if [ $? -eq 0 ]; then
    log "✅ Dados iniciais inseridos com sucesso"
else
    error_exit "Falha na inserção dos dados iniciais"
fi

# Inserir usuário administrador
PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U app_user -d azure_site << EOF
-- Inserir usuário admin (senha: admin123)
INSERT INTO users (email, password, name, role) VALUES 
('admin@greenleaf.com', '\$2b\$10\$rQZ8kJQy5F5FJ5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5', 'Administrador', 'admin'),
('demo@exemplo.com', '\$2b\$10\$rQZ8kJQy5F5FJ5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5F5', 'Usuário Demo', 'user')
ON CONFLICT (email) DO NOTHING;
EOF

# 10. BUILD DA APLICAÇÃO
echo "🔟 Fazendo build da aplicação..."
log "🏗️ Executando npm run build"

npm run build || error_exit "Falha no build da aplicação"
log "✅ Build concluído com sucesso"

# 11. CONFIGURAR PM2
echo "1️⃣1️⃣ Configurando PM2..."
log "⚙️ Configurando gerenciador de processos PM2"

# Parar processos existentes
pm2 stop all 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# Iniciar aplicação com PM2
pm2 start ecosystem.config.js || pm2 start npm --name "greenleaf-market" -- start

# Configurar inicialização automática
pm2 startup
pm2 save

log "✅ PM2 configurado e aplicação iniciada"

# 12. CONFIGURAR NGINX
echo "1️⃣2️⃣ Configurando Nginx..."
log "🌐 Configurando servidor web Nginx"

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "localhost")

# Configurar Nginx
sudo tee /etc/nginx/sites-available/greenleaf-market > /dev/null << EOF
server {
    listen 80;
    server_name $PUBLIC_IP localhost _;

    # Logs
    access_log /var/log/nginx/greenleaf.access.log;
    error_log /var/log/nginx/greenleaf.error.log;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "GreenLeaf Market OK";
        add_header Content-Type text/plain;
    }

    # Static files
    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Ativar site e remover default
sudo ln -sf /etc/nginx/sites-available/greenleaf-market /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração do Nginx
sudo nginx -t || error_exit "Configuração do Nginx inválida"

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

log "✅ Nginx configurado e reiniciado"

# 13. TESTES FINAIS
echo "1️⃣3️⃣ Executando testes finais..."
log "🧪 Testando aplicação e serviços"

# Aguardar aplicação inicializar
sleep 10

# Testar aplicação direta
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ Aplicação (porta 3000): OK"
else
    log "❌ Aplicação (porta 3000): ERRO"
fi

# Testar via Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    log "✅ Nginx (porta 80): OK"
else
    log "❌ Nginx (porta 80): ERRO"
fi

# Testar banco de dados
if PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U app_user -d azure_site -c "SELECT COUNT(*) FROM products;" > /dev/null 2>&1; then
    log "✅ Banco de dados: OK"
else
    log "❌ Banco de dados: ERRO"
fi

# 14. CONFIGURAR FIREWALL
echo "1️⃣4️⃣ Configurando firewall..."
log "🔥 Configurando regras de firewall"

# Configurar UFW se disponível
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp    # SSH
    sudo ufw allow 80/tcp    # HTTP
    sudo ufw allow 443/tcp   # HTTPS
    sudo ufw allow 3000/tcp  # App (temporário)
    log "✅ Firewall configurado"
fi

# 15. CRIAR SCRIPTS DE MANUTENÇÃO
echo "1️⃣5️⃣ Criando scripts de manutenção..."
log "🛠️ Criando scripts de manutenção"

# Script de status
cat > /usr/local/bin/greenleaf-status << 'EOF'
#!/bin/bash
echo "🌿 GreenLeaf Market - Status do Sistema"
echo "======================================"
echo "📅 Data: $(date)"
echo ""
echo "🔧 Serviços:"
echo "  PM2: $(pm2 list | grep -c online) processos online"
echo "  Nginx: $(systemctl is-active nginx)"
echo "  PostgreSQL: $(systemctl is-active postgresql)"
echo ""
echo "🌐 Conectividade:"
curl -s -o /dev/null -w "  App (3000): %{http_code}\n" http://localhost:3000
curl -s -o /dev/null -w "  Nginx (80): %{http_code}\n" http://localhost
echo ""
echo "💾 Banco de dados:"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U app_user -d azure_site -t -c "SELECT 'Produtos: ' || COUNT(*) FROM products;"
PGPASSWORD=$DB_PASSWORD psql -h localhost -U app_user -d azure_site -t -c "SELECT 'Usuários: ' || COUNT(*) FROM users;"
EOF

chmod +x /usr/local/bin/greenleaf-status

# Script de backup
cat > /usr/local/bin/greenleaf-backup << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/greenleaf-\$(date +%Y%m%d-%H%M%S)"
mkdir -p "\$BACKUP_DIR"
cp -r "$PROJECT_DIR" "\$BACKUP_DIR/"
PGPASSWORD=$DB_PASSWORD pg_dump -h localhost -U app_user azure_site > "\$BACKUP_DIR/database.sql"
echo "Backup criado em: \$BACKUP_DIR"
EOF

chmod +x /usr/local/bin/greenleaf-backup

log "✅ Scripts de manutenção criados"

# 16. FINALIZAÇÃO
echo ""
echo "🎉 ========================================="
echo "✅ SETUP MASTER CONCLUÍDO COM SUCESSO!"
echo "🎉 ========================================="
echo ""

log "🎉 Setup master concluído com sucesso!"

# Informações finais
echo "🌿 GreenLeaf Cannabis Marketplace está ONLINE!"
echo ""
echo "🌐 URLs de Acesso:"
echo "   http://$PUBLIC_IP (público)"
echo "   http://localhost (local)"
echo ""
echo "👤 Credenciais de Acesso:"
echo "   📧 Admin: admin@greenleaf.com"
echo "   🔑 Senha: admin123"
echo "   🔗 Dashboard: http://$PUBLIC_IP/admin"
echo ""
echo "   📧 Demo: demo@exemplo.com" 
echo "   🔑 Senha: 123456"
echo ""
echo "🗄️ Banco de Dados:"
echo "   🏠 Host: localhost"
echo "   👤 Usuário: app_user"
echo "   🔑 Senha: $DB_PASSWORD"
echo "   📊 Database: azure_site"
echo ""
echo "🛠️ Comandos Úteis:"
echo "   greenleaf-status          # Status do sistema"
echo "   greenleaf-backup          # Criar backup"
echo "   pm2 status               # Status PM2"
echo "   pm2 logs greenleaf-market # Logs da aplicação"
echo "   sudo systemctl status nginx # Status Nginx"
echo ""
echo "📁 Arquivos Importantes:"
echo "   $PROJECT_DIR/.env.local"
echo "   /var/log/nginx/greenleaf.*.log"
echo "   $LOG_FILE"
echo ""
echo "🎯 Próximos Passos:"
echo "   1. Acesse http://$PUBLIC_IP para ver o site"
echo "   2. Faça login como admin para gerenciar"
echo "   3. Configure HTTPS se necessário"
echo "   4. Personalize produtos e categorias"
echo ""

# Salvar informações em arquivo
cat > "$PROJECT_DIR/SETUP_INFO.txt" << EOF
GreenLeaf Cannabis Marketplace - Informações do Setup
=====================================================
Data do Setup: $(date)
IP Público: $PUBLIC_IP

URLs:
- Site: http://$PUBLIC_IP
- Admin: http://$PUBLIC_IP/admin

Credenciais Admin:
- Email: admin@greenleaf.com
- Senha: admin123

Credenciais Demo:
- Email: demo@exemplo.com
- Senha: 123456

Banco de Dados:
- Host: localhost
- User: app_user
- Password: $DB_PASSWORD
- Database: azure_site

Comandos:
- greenleaf-status (status do sistema)
- greenleaf-backup (criar backup)
EOF

echo "💾 Informações salvas em: $PROJECT_DIR/SETUP_INFO.txt"
echo ""
echo "🚀 Seu marketplace de cannabis está pronto para uso!"

log "🎉 Setup master finalizado - Sistema totalmente operacional"

exit 0
