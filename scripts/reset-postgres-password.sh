#!/bin/bash

echo "🔐 RESET DE SENHA POSTGRESQL (Execute na vm-private)"
echo "=================================================="
echo ""
echo "⚠️  Este script deve ser executado NA VM-PRIVATE onde está o PostgreSQL"
echo ""
read -p "🤔 Você está na vm-private? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Execute este script na vm-private"
    exit 1
fi

echo ""
echo "🔧 Resetando senha do PostgreSQL..."

# Parar PostgreSQL
sudo systemctl stop postgresql

# Iniciar em modo single-user para reset
sudo -u postgres postgres --single -D /var/lib/postgresql/*/main <<EOF
ALTER USER postgres PASSWORD 'password';
EOF

# Reiniciar PostgreSQL
sudo systemctl start postgresql

echo ""
echo "✅ Senha resetada para: password"
echo ""
echo "🔧 Configurando acesso remoto..."

# Configurar postgresql.conf
PG_VERSION=$(ls /etc/postgresql/)
PG_CONFIG="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Backup dos arquivos
sudo cp "$PG_CONFIG" "$PG_CONFIG.backup"
sudo cp "$PG_HBA" "$PG_HBA.backup"

# Configurar listen_addresses
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONFIG"

# Configurar pg_hba.conf para permitir conexões da rede
echo "# Permitir conexões da rede interna" | sudo tee -a "$PG_HBA"
echo "host    all             all             10.0.0.0/8              md5" | sudo tee -a "$PG_HBA"
echo "host    all             all             192.168.0.0/16          md5" | sudo tee -a "$PG_HBA"

# Reiniciar PostgreSQL
sudo systemctl restart postgresql

echo ""
echo "🎉 PostgreSQL configurado!"
echo ""
echo "📋 Informações:"
echo "   Usuário: postgres"
echo "   Senha: password"
echo "   Acesso remoto: ✅ Habilitado"
echo ""
echo "🧪 Teste da vm-bastion:"
echo "   psql -h $(hostname -I | awk '{print $1}') -U postgres -d postgres"
