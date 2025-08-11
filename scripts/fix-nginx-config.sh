#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌐 Corrigindo configuração do Nginx...${NC}"

# Backup da configuração atual
if [ -f /etc/nginx/sites-enabled/greenleaf-market ]; then
    echo -e "${YELLOW}📦 Fazendo backup da configuração atual...${NC}"
    sudo cp /etc/nginx/sites-enabled/greenleaf-market /etc/nginx/sites-enabled/greenleaf-market.backup
fi

# Criar nova configuração limpa
echo -e "${YELLOW}⚙️ Criando nova configuração...${NC}"

sudo tee /etc/nginx/sites-available/estacao-fumaca > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Proxy to Next.js app
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
        proxy_read_timeout 86400;
    }
    
    # Static files
    location /_next/static {
        proxy_cache STATIC;
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # Favicon
    location /favicon.ico {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=86400";
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Remover configuração antiga se existir
if [ -f /etc/nginx/sites-enabled/greenleaf-market ]; then
    sudo rm /etc/nginx/sites-enabled/greenleaf-market
fi

# Ativar nova configuração
sudo ln -sf /etc/nginx/sites-available/estacao-fumaca /etc/nginx/sites-enabled/

# Testar configuração
echo -e "${YELLOW}🔍 Testando configuração do Nginx...${NC}"

if sudo nginx -t; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
    
    # Recarregar Nginx
    echo -e "${YELLOW}🔄 Recarregando Nginx...${NC}"
    sudo systemctl reload nginx
    
    if sudo systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao recarregar Nginx${NC}"
        sudo systemctl status nginx
        exit 1
    fi
else
    echo -e "${RED}❌ Configuração inválida do Nginx${NC}"
    
    # Restaurar backup se existir
    if [ -f /etc/nginx/sites-enabled/greenleaf-market.backup ]; then
        echo -e "${YELLOW}🔄 Restaurando backup...${NC}"
        sudo cp /etc/nginx/sites-enabled/greenleaf-market.backup /etc/nginx/sites-enabled/greenleaf-market
        sudo rm /etc/nginx/sites-enabled/estacao-fumaca
    fi
    exit 1
fi

echo -e "${GREEN}🎉 Nginx configurado com sucesso!${NC}"
echo -e "${GREEN}🌐 Site disponível em: http://$(curl -s ifconfig.me)${NC}"
