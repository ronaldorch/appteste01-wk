#!/bin/bash

echo "🔍 Diagnosticando erro 502 Bad Gateway..."
echo "=================================="

# 1. Verificar status do PM2
echo "1. Status do PM2:"
pm2 status
echo ""

# 2. Verificar logs do PM2
echo "2. Logs recentes do PM2:"
pm2 logs azure-site --lines 20
echo ""

# 3. Verificar se a aplicação está rodando na porta 3000
echo "3. Verificando porta 3000:"
sudo netstat -tlnp | grep 3000
echo ""

# 4. Testar se a aplicação responde localmente
echo "4. Testando aplicação localmente:"
curl -I http://localhost:3000 2>/dev/null || echo "❌ Aplicação não responde na porta 3000"
echo ""

# 5. Verificar status do Nginx
echo "5. Status do Nginx:"
sudo systemctl status nginx --no-pager -l
echo ""

# 6. Verificar configuração do Nginx
echo "6. Configuração do Nginx:"
sudo nginx -t
echo ""

# 7. Verificar logs do Nginx
echo "7. Logs de erro do Nginx:"
sudo tail -20 /var/log/nginx/error.log
echo ""

# 8. Verificar logs de acesso do Nginx
echo "8. Logs de acesso do Nginx:"
sudo tail -10 /var/log/nginx/access.log
echo ""

# 9. Verificar se há erros de build
echo "9. Verificando diretório .next:"
ls -la /var/www/azure-site/.next/ 2>/dev/null || echo "❌ Diretório .next não encontrado"
echo ""

# 10. Verificar variáveis de ambiente
echo "10. Verificando arquivo .env:"
if [ -f "/var/www/azure-site/.env.local" ]; then
    echo "✅ Arquivo .env.local existe"
    echo "Variáveis (sem valores sensíveis):"
    grep -E "^[A-Z]" /var/www/azure-site/.env.local | cut -d'=' -f1
else
    echo "❌ Arquivo .env.local não encontrado"
fi
echo ""

# 11. Verificar espaço em disco
echo "11. Espaço em disco:"
df -h /var/www/azure-site/
echo ""

# 12. Verificar memória
echo "12. Uso de memória:"
free -h
echo ""

echo "=================================="
echo "🔧 Diagnóstico concluído!"
