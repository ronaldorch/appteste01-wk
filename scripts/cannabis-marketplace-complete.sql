-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de categorias de produtos
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tipos de extração
CREATE TABLE IF NOT EXISTS extraction_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color_code VARCHAR(7) DEFAULT '#10B981',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de genéticas
CREATE TABLE IF NOT EXISTS genetic_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    strain_type VARCHAR(20) CHECK (strain_type IN ('indica', 'sativa', 'hybrid')),
    thc_min DECIMAL(4,2) DEFAULT 0,
    thc_max DECIMAL(4,2) DEFAULT 0,
    cbd_min DECIMAL(4,2) DEFAULT 0,
    cbd_max DECIMAL(4,2) DEFAULT 0,
    description TEXT,
    effects TEXT[],
    flavors TEXT[],
    medical_uses TEXT[],
    growing_difficulty VARCHAR(20) DEFAULT 'medium',
    flowering_time_weeks INTEGER,
    yield_indoor VARCHAR(50),
    yield_outdoor VARCHAR(50),
    image_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (baseados nos templates)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES genetic_templates(id),
    extraction_type_id INTEGER REFERENCES extraction_types(id),
    category_id INTEGER REFERENCES categories(id),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    description TEXT,
    price_per_gram DECIMAL(10,2) NOT NULL,
    stock_grams DECIMAL(10,3) DEFAULT 0,
    min_order_grams DECIMAL(10,3) DEFAULT 1.0,
    max_order_grams DECIMAL(10,3) DEFAULT 100.0,
    thc_percentage DECIMAL(4,2),
    cbd_percentage DECIMAL(4,2),
    lab_tested BOOLEAN DEFAULT false,
    lab_report_url TEXT,
    harvest_date DATE,
    batch_number VARCHAR(50),
    image_urls TEXT[],
    tags TEXT[],
    featured BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    auto_deactivate_on_zero_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de estoque
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    change_type VARCHAR(20) CHECK (change_type IN ('add', 'remove', 'sale', 'adjustment')),
    quantity_grams DECIMAL(10,3) NOT NULL,
    previous_stock DECIMAL(10,3),
    new_stock DECIMAL(10,3),
    reason TEXT,
    user_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categories (name, description) VALUES 
('Flores', 'Flores secas de cannabis premium'),
('Extrações', 'Concentrados e extratos de cannabis'),
('Edibles', 'Produtos comestíveis com cannabis'),
('Acessórios', 'Acessórios para consumo')
ON CONFLICT (name) DO NOTHING;

-- Inserir tipos de extração
INSERT INTO extraction_types (name, description, color_code) VALUES 
('Ice', 'Extração com gelo e água (Ice Water Hash)', '#3B82F6'),
('PAC', 'Extração com solvente PAC', '#8B5CF6'),
('Dry', 'Extração a seco (Dry Sift)', '#F59E0B'),
('Rosin', 'Extração por pressão e calor', '#EF4444'),
('Live Resin', 'Extração de planta fresca congelada', '#10B981'),
('BHO', 'Extração com butano', '#F97316'),
('CO2', 'Extração com CO2 supercrítico', '#06B6D4')
ON CONFLICT (name) DO NOTHING;

-- Inserir templates de genéticas famosas
INSERT INTO genetic_templates (
    name, strain_type, thc_min, thc_max, cbd_min, cbd_max, 
    description, effects, flavors, medical_uses, 
    flowering_time_weeks, yield_indoor, yield_outdoor
) VALUES 
(
    'OG Kush', 'hybrid', 20.0, 25.0, 0.1, 0.3,
    'Lendária strain californiana com efeitos potentes e sabor único',
    ARRAY['relaxante', 'eufórico', 'criativo', 'feliz'],
    ARRAY['terroso', 'pinho', 'limão', 'diesel'],
    ARRAY['ansiedade', 'estresse', 'dor', 'insônia'],
    8, '400-500g/m²', '500-600g/planta'
),
(
    'White Widow', 'hybrid', 18.0, 25.0, 0.2, 0.5,
    'Híbrida holandesa clássica com tricomas brancos abundantes',
    ARRAY['energético', 'criativo', 'eufórico', 'focado'],
    ARRAY['terroso', 'amadeirado', 'picante', 'doce'],
    ARRAY['depressão', 'estresse', 'fadiga', 'dor'],
    9, '450-550g/m²', '550-650g/planta'
),
(
    'Amnesia Haze', 'sativa', 20.0, 25.0, 0.1, 0.2,
    'Sativa energética com efeitos cerebrais intensos',
    ARRAY['energético', 'criativo', 'eufórico', 'sociável'],
    ARRAY['cítrico', 'terroso', 'doce', 'picante'],
    ARRAY['depressão', 'fadiga', 'estresse', 'falta de apetite'],
    10, '600-650g/m²', '700-800g/planta'
),
(
    'Northern Lights', 'indica', 16.0, 21.0, 0.1, 0.3,
    'Indica pura com efeitos relaxantes profundos',
    ARRAY['relaxante', 'sonolento', 'feliz', 'tranquilo'],
    ARRAY['doce', 'picante', 'terroso', 'pinho'],
    ARRAY['insônia', 'dor', 'estresse', 'falta de apetite'],
    7, '400-500g/m²', '500-600g/planta'
),
(
    'Sour Diesel', 'sativa', 19.0, 25.0, 0.1, 0.2,
    'Sativa energética com aroma diesel característico',
    ARRAY['energético', 'criativo', 'eufórico', 'focado'],
    ARRAY['diesel', 'cítrico', 'terroso', 'picante'],
    ARRAY['depressão', 'fadiga', 'estresse', 'dor'],
    10, '450-550g/m²', '600-700g/planta'
),
(
    'Blue Dream', 'hybrid', 17.0, 24.0, 0.1, 0.2,
    'Híbrida californiana com efeitos equilibrados',
    ARRAY['relaxante', 'criativo', 'eufórico', 'feliz'],
    ARRAY['frutas vermelhas', 'doce', 'terroso', 'floral'],
    ARRAY['dor', 'depressão', 'náusea', 'estresse'],
    9, '500-600g/m²', '600-700g/planta'
),
(
    'Girl Scout Cookies', 'hybrid', 19.0, 28.0, 0.1, 0.2,
    'Híbrida potente com sabor doce e efeitos duradouros',
    ARRAY['relaxante', 'eufórico', 'criativo', 'feliz'],
    ARRAY['doce', 'terroso', 'menta', 'chocolate'],
    ARRAY['dor', 'náusea', 'falta de apetite', 'estresse'],
    9, '400-500g/m²', '500-600g/planta'
),
(
    'Gorilla Glue #4', 'hybrid', 25.0, 30.0, 0.1, 0.1,
    'Híbrida extremamente potente com efeitos intensos',
    ARRAY['relaxante', 'eufórico', 'sonolento', 'feliz'],
    ARRAY['terroso', 'pinho', 'azedo', 'chocolate'],
    ARRAY['dor', 'insônia', 'estresse', 'depressão'],
    8, '500-600g/m²', '600-700g/planta'
)
ON CONFLICT DO NOTHING;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_genetic_templates_updated_at BEFORE UPDATE ON genetic_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para auto-desativar produtos sem estoque
CREATE OR REPLACE FUNCTION auto_deactivate_zero_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_grams <= 0 AND NEW.auto_deactivate_on_zero_stock = true THEN
        NEW.active = false;
    ELSIF NEW.stock_grams > 0 AND OLD.stock_grams <= 0 AND NEW.auto_deactivate_on_zero_stock = true THEN
        NEW.active = true;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para auto-desativação
CREATE TRIGGER auto_deactivate_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION auto_deactivate_zero_stock();

-- Função para registrar histórico de estoque
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND OLD.stock_grams != NEW.stock_grams THEN
        INSERT INTO stock_history (product_id, change_type, quantity_grams, previous_stock, new_stock, reason)
        VALUES (
            NEW.id, 
            CASE 
                WHEN NEW.stock_grams > OLD.stock_grams THEN 'add'
                ELSE 'remove'
            END,
            ABS(NEW.stock_grams - OLD.stock_grams),
            OLD.stock_grams,
            NEW.stock_grams,
            'Automatic stock update'
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para histórico de estoque
CREATE TRIGGER log_stock_changes AFTER UPDATE ON products FOR EACH ROW EXECUTE FUNCTION log_stock_change();

-- Criar alguns produtos exemplo baseados nos templates
INSERT INTO products (
    template_id, extraction_type_id, category_id, name, slug, 
    description, price_per_gram, stock_grams, thc_percentage, cbd_percentage
)
SELECT 
    gt.id,
    et.id,
    c.id,
    gt.name || ' - ' || et.name,
    LOWER(REPLACE(REPLACE(gt.name || '-' || et.name, ' ', '-'), '#', '')),
    'Produto premium de ' || gt.name || ' extraído com método ' || et.name,
    CASE et.name
        WHEN 'Ice' THEN 45.00
        WHEN 'PAC' THEN 55.00
        WHEN 'Dry' THEN 35.00
        WHEN 'Rosin' THEN 65.00
        WHEN 'Live Resin' THEN 75.00
        ELSE 50.00
    END,
    ROUND((RANDOM() * 50 + 10)::numeric, 3),
    gt.thc_max,
    gt.cbd_max
FROM genetic_templates gt
CROSS JOIN extraction_types et
JOIN categories c ON c.name = 'Extrações'
WHERE gt.id <= 4 AND et.id <= 3
ON CONFLICT (slug) DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_template ON products(template_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_grams);
CREATE INDEX IF NOT EXISTS idx_stock_history_product ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_date ON stock_history(created_at);

-- Verificar se tudo foi criado
SELECT 'Tables created:' as info;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

SELECT 'Sample data:' as info;
SELECT COUNT(*) as genetic_templates FROM genetic_templates;
SELECT COUNT(*) as extraction_types FROM extraction_types;
SELECT COUNT(*) as categories FROM categories;
SELECT COUNT(*) as products FROM products;
