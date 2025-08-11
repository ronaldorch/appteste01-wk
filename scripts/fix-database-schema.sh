#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 Corrigindo schema do banco de dados...${NC}"

# Solicitar dados de conexão
read -p "🔗 IP da vm-private: " DB_HOST
read -p "🔢 Porta (5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}
read -p "📊 Nome do banco (azure_site): " DB_NAME
DB_NAME=${DB_NAME:-azure_site}
read -p "👤 Usuário (app_user): " DB_USER
DB_USER=${DB_USER:-app_user}
read -s -p "🔐 Senha: " DB_PASSWORD
echo

# Testar conexão
echo -e "${YELLOW}🔍 Testando conexão...${NC}"
export PGPASSWORD="$DB_PASSWORD"

if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Conexão estabelecida${NC}"

# Corrigir schema
echo -e "${YELLOW}🗄️ Corrigindo estrutura das tabelas...${NC}"

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" << 'EOF'
-- Adicionar coluna password na tabela users se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN
        ALTER TABLE users ADD COLUMN password VARCHAR(255);
    END IF;
END $$;

-- Adicionar coluna total_amount na tabela orders se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- Adicionar outras colunas necessárias
DO $$ 
BEGIN
    -- Adicionar colunas de especificações de cannabis
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='thc_level') THEN
        ALTER TABLE products ADD COLUMN thc_level VARCHAR(20) DEFAULT '20-25%';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cbd_level') THEN
        ALTER TABLE products ADD COLUMN cbd_level VARCHAR(20) DEFAULT '1-3%';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='strain_type') THEN
        ALTER TABLE products ADD COLUMN strain_type VARCHAR(50) DEFAULT 'Híbrida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='effects') THEN
        ALTER TABLE products ADD COLUMN effects TEXT[] DEFAULT ARRAY['Relaxante', 'Eufórico'];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='flavors') THEN
        ALTER TABLE products ADD COLUMN flavors TEXT[] DEFAULT ARRAY['Terroso', 'Doce'];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='flowering_time') THEN
        ALTER TABLE products ADD COLUMN flowering_time VARCHAR(50) DEFAULT '8-10 semanas';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='difficulty') THEN
        ALTER TABLE products ADD COLUMN difficulty VARCHAR(20) DEFAULT 'Médio';
    END IF;
END $$;

-- Atualizar dados existentes
UPDATE users SET password = '$2b$10$rQJ8vQZ9yGz8vQZ9yGz8vOJ8vQZ9yGz8vQZ9yGz8vQZ9yGz8vQZ9yG' WHERE password IS NULL;

-- Inserir usuários se não existirem
INSERT INTO users (email, password, name, role, created_at, updated_at) 
VALUES 
    ('admin@estacaofumaca.com', '$2b$10$rQJ8vQZ9yGz8vQZ9yGz8vOJ8vQZ9yGz8vQZ9yGz8vQZ9yGz8vQZ9yG', 'Admin', 'admin', NOW(), NOW()),
    ('demo@exemplo.com', '$2b$10$rQJ8vQZ9yGz8vQZ9yGz8vOJ8vQZ9yGz8vQZ9yGz8vQZ9yGz8vQZ9yG', 'Demo User', 'user', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Atualizar produtos com especificações de cannabis
UPDATE products SET 
    thc_level = CASE 
        WHEN name LIKE '%Kush%' THEN '22-28%'
        WHEN name LIKE '%Haze%' THEN '18-24%'
        WHEN name LIKE '%Colombian%' THEN '15-20%'
        WHEN name LIKE '%Diesel%' THEN '20-26%'
        ELSE '18-25%'
    END,
    cbd_level = CASE 
        WHEN name LIKE '%CBD%' THEN '8-15%'
        WHEN name LIKE '%Medical%' THEN '5-10%'
        ELSE '1-3%'
    END,
    strain_type = CASE 
        WHEN name LIKE '%Kush%' OR name LIKE '%Purple%' THEN 'Indica'
        WHEN name LIKE '%Haze%' OR name LIKE '%Sativa%' OR name LIKE '%Colombian%' THEN 'Sativa'
        ELSE 'Híbrida'
    END,
    effects = CASE 
        WHEN name LIKE '%Kush%' THEN ARRAY['Relaxante', 'Sonolento', 'Apetite']
        WHEN name LIKE '%Haze%' THEN ARRAY['Eufórico', 'Criativo', 'Energético']
        WHEN name LIKE '%Diesel%' THEN ARRAY['Focado', 'Feliz', 'Energético']
        ELSE ARRAY['Relaxante', 'Eufórico', 'Criativo']
    END,
    flavors = CASE 
        WHEN name LIKE '%Kush%' THEN ARRAY['Terroso', 'Pinho', 'Doce']
        WHEN name LIKE '%Haze%' THEN ARRAY['Cítrico', 'Doce', 'Floral']
        WHEN name LIKE '%Diesel%' THEN ARRAY['Combustível', 'Cítrico', 'Pungente']
        ELSE ARRAY['Terroso', 'Doce', 'Herbal']
    END,
    flowering_time = CASE 
        WHEN strain_type = 'Indica' THEN '7-9 semanas'
        WHEN strain_type = 'Sativa' THEN '10-12 semanas'
        ELSE '8-10 semanas'
    END,
    difficulty = CASE 
        WHEN name LIKE '%Auto%' THEN 'Fácil'
        WHEN name LIKE '%Kush%' THEN 'Médio'
        ELSE 'Médio'
    END
WHERE thc_level IS NULL OR thc_level = '20-25%';

EOF

echo -e "${GREEN}✅ Schema do banco corrigido com sucesso!${NC}"

# Verificar se as correções foram aplicadas
echo -e "${YELLOW}🔍 Verificando correções...${NC}"

USERS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users WHERE password IS NOT NULL;")
PRODUCTS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM products WHERE thc_level IS NOT NULL;")

echo -e "${GREEN}👥 Usuários com senha: $USERS_COUNT${NC}"
echo -e "${GREEN}🌿 Produtos com especificações: $PRODUCTS_COUNT${NC}"

echo -e "${GREEN}🎉 Correção do banco concluída!${NC}"
