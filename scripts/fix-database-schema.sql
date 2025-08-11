-- Corrigir esquema do banco de dados
-- Adicionar colunas faltantes na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Corrigir tabela genetic_templates
ALTER TABLE genetic_templates ADD COLUMN IF NOT EXISTS type VARCHAR(100) DEFAULT 'flower';
ALTER TABLE genetic_templates ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'hybrid';

-- Corrigir tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS template_id INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar foreign key se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'products_template_id_fkey'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES genetic_templates(id);
    END IF;
END $$;

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_products_template_id ON products(template_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- Atualizar dados existentes
UPDATE genetic_templates SET type = 'flower' WHERE type IS NULL;
UPDATE genetic_templates SET category = 'hybrid' WHERE category IS NULL;
UPDATE products SET is_active = true WHERE is_active IS NULL;

-- Verificar estrutura
SELECT 'Schema fixed successfully!' as status;
