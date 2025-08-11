#!/bin/bash

echo "🔧 Corrigindo build do Next.js e reiniciando aplicação..."
echo "======================================================"

cd /var/www/azure-site

# 1. Parar aplicação
echo "1. Parando aplicação..."
pm2 stop azure-site 2>/dev/null || true
pm2 delete azure-site 2>/dev/null || true

# 2. Limpar builds anteriores
echo "2. Limpando builds anteriores..."
rm -rf .next/
rm -rf node_modules/.cache/

# 3. Verificar se há problemas com dependências
echo "3. Verificando dependências..."
if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
    echo "Reinstalando dependências..."
    rm -rf node_modules package-lock.json
    npm install
fi

# 4. Fazer build limpo
echo "4. Fazendo build do Next.js..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build! Tentando corrigir..."
    
    # Verificar se há erros de TypeScript
    echo "Verificando erros de TypeScript..."
    npx tsc --noEmit --skipLibCheck || true
    
    # Tentar build novamente com mais detalhes
    echo "Tentando build novamente..."
    npm run build -- --debug
    
    if [ $? -ne 0 ]; then
        echo "❌ Build ainda falha. Verificando problemas..."
        exit 1
    fi
fi

# 5. Verificar se o build foi criado
echo "5. Verificando build..."
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build criado com sucesso!"
    echo "Build ID: $(cat .next/BUILD_ID)"
else
    echo "❌ Build não foi criado corretamente!"
    exit 1
fi

# 6. Testar aplicação antes de usar PM2
echo "6. Testando aplicação..."
timeout 15s npm start &
APP_PID=$!
sleep 8

if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação funciona corretamente"
    kill $APP_PID 2>/dev/null || true
else
    echo "❌ Aplicação ainda não funciona"
    kill $APP_PID 2>/dev/null || true
    
    # Tentar em modo desenvolvimento para debug
    echo "Testando em modo desenvolvimento..."
    timeout 10s npm run dev &
    DEV_PID=$!
    sleep 5
    kill $DEV_PID 2>/dev/null || true
    exit 1
fi

# 7. Iniciar com PM2
echo "7. Iniciando com PM2..."
pm2 start npm --name "azure-site" -- start

# Aguardar inicialização
sleep 5

# Verificar se PM2 está funcionando
if pm2 list | grep -q "azure-site.*online"; then
    echo "✅ PM2 iniciado com sucesso"
else
    echo "❌ Erro no PM2"
    pm2 logs azure-site --lines 10
    exit 1
fi

# 8. Configurar PM2 para auto-restart
echo "8. Configurando PM2..."
pm2 save

# 9. Verificar Nginx
echo "9. Verificando Nginx..."
sudo systemctl status nginx --no-pager -l

if ! systemctl is-active --quiet nginx; then
    echo "Reiniciando Nginx..."
    sudo systemctl restart nginx
fi

# 10. Teste final
echo "10. Teste final..."
sleep 3

# Testar aplicação direta
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Aplicação (porta 3000): OK"
else
    echo "❌ Aplicação (porta 3000): ERRO"
    pm2 logs azure-site --lines 5
fi

# Testar via Nginx
if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Nginx (porta 80): OK"
else
    echo "❌ Nginx (porta 80): ERRO"
    sudo tail -5 /var/log/nginx/error.log
fi

# Obter IP público
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null || echo "IP não detectado")

echo ""
echo "🎉 =================================="
echo "✅ APLICAÇÃO REINICIADA!"
echo "🎉 =================================="
echo ""
echo "🌐 Acesse sua aplicação:"
echo "   http://$PUBLIC_IP"
echo "   http://$PUBLIC_IP:3000 (direto)"
echo ""
echo "📋 Credenciais de teste:"
echo "   Email: demo@exemplo.com"
echo "   Senha: 123456"
echo ""
echo "🔧 Comandos úteis:"
echo "   pm2 status"
echo "   pm2 logs azure-site"
echo "   pm2 restart azure-site"
echo ""
