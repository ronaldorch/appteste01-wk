-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários (já criada anteriormente)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de templates de genéticas
CREATE TABLE IF NOT EXISTS genetic_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'flower', 'extract', 'edible'
    category VARCHAR(100) NOT NULL, -- 'indica', 'sativa', 'hybrid'
    thc_percentage DECIMAL(5,2),
    cbd_percentage DECIMAL(5,2),
    description TEXT,
    effects TEXT[], -- Array de efeitos
    flavors TEXT[], -- Array de sabores
    medical_uses TEXT[], -- Array de usos medicinais
    growing_difficulty VARCHAR(50), -- 'easy', 'medium', 'hard'
    flowering_time VARCHAR(50),
    yield_info VARCHAR(255),
    genetics VARCHAR(255), -- Linhagem genética
    breeder VARCHAR(255),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de produtos (instâncias dos templates com estoque)
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES genetic_templates(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    extraction_type VARCHAR(100), -- 'ice', 'pac', 'dry', 'rosin', 'live_resin', 'co2', 'butane'
    price_per_gram DECIMAL(10,2) NOT NULL,
    stock_grams DECIMAL(10,3) DEFAULT 0, -- Estoque em gramas com 3 casas decimais
    minimum_order DECIMAL(10,3) DEFAULT 0.5, -- Pedido mínimo em gramas
    maximum_order DECIMAL(10,3) DEFAULT 100, -- Pedido máximo em gramas
    batch_number VARCHAR(100),
    harvest_date DATE,
    lab_tested BOOLEAN DEFAULT false,
    lab_results JSONB, -- Resultados de laboratório em JSON
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de estoque
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    change_type VARCHAR(50) NOT NULL, -- 'add', 'remove', 'sale', 'adjustment'
    quantity_change DECIMAL(10,3) NOT NULL, -- Pode ser negativo
    previous_stock DECIMAL(10,3) NOT NULL,
    new_stock DECIMAL(10,3) NOT NULL,
    reason TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(100),
    payment_status VARCHAR(50) DEFAULT 'pending',
    delivery_method VARCHAR(100), -- 'pickup', 'delivery'
    delivery_address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity_grams DECIMAL(10,3) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_products_template_id ON products(template_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON stock_history(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger nas tabelas
CREATE TRIGGER update_genetic_templates_updated_at BEFORE UPDATE ON genetic_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para desativar produto quando estoque zerar
CREATE OR REPLACE FUNCTION check_stock_and_deactivate()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.stock_grams <= 0 THEN
        NEW.is_active = false;
    ELSIF NEW.stock_grams > 0 AND OLD.stock_grams <= 0 THEN
        NEW.is_active = true;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER auto_deactivate_on_zero_stock BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION check_stock_and_deactivate();

-- Inserir templates de genéticas populares
INSERT INTO genetic_templates (name, type, category, thc_percentage, cbd_percentage, description, effects, flavors, medical_uses, growing_difficulty, flowering_time, yield_info, genetics, breeder) VALUES
('OG Kush', 'flower', 'hybrid', 24.5, 0.3, 'Lendária strain híbrida com efeitos potentes e sabor único', 
 ARRAY['relaxante', 'eufórico', 'criativo', 'feliz'], 
 ARRAY['terroso', 'pinho', 'limão', 'diesel'], 
 ARRAY['ansiedade', 'estresse', 'dor', 'insônia'], 
 'medium', '8-9 semanas', '400-500g/m²', 'Chemdawg x Lemon Thai x Pakistani Kush', 'Imperial Genetics'),

('White Widow', 'flower', 'hybrid', 20.0, 0.5, 'Híbrida balanceada famosa mundialmente por sua potência', 
 ARRAY['energético', 'criativo', 'social', 'focado'], 
 ARRAY['doce', 'terroso', 'amadeirado', 'especiarias'], 
 ARRAY['depressão', 'fadiga', 'estresse', 'dor'], 
 'easy', '8-10 semanas', '450-550g/m²', 'Brazilian Sativa x South Indian Indica', 'Green House Seeds'),

('Amnesia Haze', 'flower', 'sativa', 22.0, 0.1, 'Sativa energética com efeitos cerebrais intensos', 
 ARRAY['energético', 'criativo', 'eufórico', 'motivador'], 
 ARRAY['cítrico', 'terroso', 'doce', 'especiarias'], 
 ARRAY['depressão', 'fadiga', 'estresse', 'TDAH'], 
 'hard', '10-12 semanas', '600-700g/m²', 'Cambodian x Jamaican', 'Soma Seeds'),

('Granddaddy Purple', 'flower', 'indica', 17.0, 0.7, 'Indica relaxante com coloração roxa característica', 
 ARRAY['relaxante', 'sonolento', 'feliz', 'calmante'], 
 ARRAY['uva', 'frutas vermelhas', 'doce', 'terroso'], 
 ARRAY['insônia', 'dor', 'estresse', 'perda de apetite'], 
 'easy', '8-11 semanas', '300-400g/m²', 'Purple Urkle x Big Bud', 'Ken Estes'),

('Sour Diesel', 'flower', 'sativa', 25.0, 0.2, 'Sativa energética com aroma diesel característico', 
 ARRAY['energético', 'criativo', 'eufórico', 'social'], 
 ARRAY['diesel', 'cítrico', 'terroso', 'pungente'], 
 ARRAY['depressão', 'fadiga', 'estresse', 'dor'], 
 'medium', '10-11 semanas', '450-550g/m²', 'Chemdawg 91 x Super Skunk', 'DNA Genetics')

ON CONFLICT DO NOTHING;

-- Inserir alguns produtos baseados nos templates
INSERT INTO products (template_id, name, slug, extraction_type, price_per_gram, stock_grams, batch_number, harvest_date, lab_tested) 
SELECT 
    gt.id,
    gt.name || ' - Flower',
    LOWER(REPLACE(gt.name, ' ', '-')) || '-flower',
    'dry',
    CASE 
        WHEN gt.category = 'sativa' THEN 45.00
        WHEN gt.category = 'indica' THEN 40.00
        ELSE 42.50
    END,
    ROUND((RANDOM() * 50 + 10)::numeric, 3), -- Entre 10 e 60 gramas
    'BATCH-' || LPAD((RANDOM() * 9999)::int::text, 4, '0'),
    CURRENT_DATE - (RANDOM() * 30)::int,
    true
FROM genetic_templates gt
WHERE gt.type = 'flower'
ON CONFLICT DO NOTHING;

-- Inserir extrações baseadas nos templates
INSERT INTO products (template_id, name, slug, extraction_type, price_per_gram, stock_grams, batch_number, harvest_date, lab_tested) 
SELECT 
    gt.id,
    gt.name || ' - Ice Hash',
    LOWER(REPLACE(gt.name, ' ', '-')) || '-ice-hash',
    'ice',
    CASE 
        WHEN gt.category = 'sativa' THEN 120.00
        WHEN gt.category = 'indica' THEN 110.00
        ELSE 115.00
    END,
    ROUND((RANDOM() * 10 + 2)::numeric, 3), -- Entre 2 e 12 gramas
    'ICE-' || LPAD((RANDOM() * 9999)::int::text, 4, '0'),
    CURRENT_DATE - (RANDOM() * 15)::int,
    true
FROM genetic_templates gt
WHERE gt.type = 'flower'
LIMIT 3
ON CONFLICT DO NOTHING;

-- Verificar dados inseridos
SELECT 'Setup completo!' as status;
SELECT COUNT(*) as total_templates FROM genetic_templates;
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_users FROM users;
