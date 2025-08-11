#!/bin/bash

echo "📊 Monitoramento da aplicação..."
echo "==============================="

while true; do
    clear
    echo "📊 Status em tempo real - $(date)"
    echo "================================"
    
    # Status PM2
    echo "🔄 PM2 Status:"
    pm2 jlist | jq -r '.[] | select(.name=="azure-site") | "Status: \(.pm2_env.status) | CPU: \(.monit.cpu)% | Memory: \(.monit.memory/1024/1024 | floor)MB"' 2>/dev/null || echo "PM2 não encontrado"
    echo ""
    
    # Teste HTTP
    echo "🌐 Teste HTTP:"
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
        echo "✅ Aplicação: OK (porta 3000)"
    else
        echo "❌ Aplicação: ERRO (porta 3000)"
    fi
    
    if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
        echo "✅ Nginx: OK (porta 80)"
    else
        echo "❌ Nginx: ERRO (porta 80)"
    fi
    echo ""
    
    # Uso de recursos
    echo "💾 Recursos do sistema:"
    echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)%"
    echo "RAM: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
    echo "Disk: $(df / | tail -1 | awk '{print $5}')"
    echo ""
    
    # Últimos logs
    echo "📝 Últimos logs (PM2):"
    pm2 logs azure-site --lines 3 --nostream 2>/dev/null | tail -3
    echo ""
    
    echo "Pressione Ctrl+C para sair..."
    sleep 5
done
