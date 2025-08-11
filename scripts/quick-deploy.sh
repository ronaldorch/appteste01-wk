#!/bin/bash

# Script rápido para deploy após git pull
echo "🚀 Deploy rápido do GreenLeaf Market..."

cd /var/www/azure-site

# Git pull
git pull origin main || git pull origin master

# Install dependencies
npm install

# Build
npm run build

# Restart PM2
pm2 restart all

# Restart Nginx
sudo systemctl restart nginx

echo "✅ Deploy concluído!"
