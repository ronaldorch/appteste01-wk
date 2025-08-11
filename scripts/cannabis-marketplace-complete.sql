-- Script completo para marketplace de cannabis
-- Execute este script no PostgreSQL

-- Limpar tabelas existentes se necessário
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_templates CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela de usuários
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de categorias
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de templates de produtos (genéticas base)
CREATE TABLE product_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    genetics VARCHAR(255),
    strain_type VARCHAR(50) CHECK (strain_type IN ('indica', 'sativa', 'hybrid')),
    thc_level VARCHAR(20),
    cbd_level VARCHAR(20),
    effects TEXT[],
    flavors TEXT[],
    flowering_time VARCHAR(50),
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    yield VARCHAR(50),
    height VARCHAR(50),
    medical_uses TEXT[],
    terpenes TEXT[],
    grow_tips TEXT[],
    base_price DECIMAL(10,2),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos (instâncias dos templates com estoque)
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES product_templates(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'gramas' CHECK (unit IN ('gramas', 'unidades')),
    extraction_type VARCHAR(50) CHECK (extraction_type IN ('flower', 'ice', 'pac', 'dry', 'rosin', 'live_resin')),
    batch_number VARCHAR(100),
    harvest_date DATE,
    test_results JSONB,
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    slug VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'out_of_stock', 'draft')),
    featured BOOLEAN DEFAULT FALSE,
    auto_deactivate BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de imagens dos produtos
CREATE TABLE product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    template_id INTEGER REFERENCES product_templates(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de pedidos
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')),
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50),
    delivery_address TEXT,
    delivery_method VARCHAR(50) DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de itens do pedido
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity DECIMAL(8,2) NOT NULL, -- Permite decimais para gramas
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX idx_products_template ON products(template_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_user ON products(user_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_stock ON products(stock_quantity);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_template ON product_images(template_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Inserir usuário admin padrão
INSERT INTO users (name, email, password, role) VALUES
('Admin', 'admin@estacaofumaca.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir categorias
INSERT INTO categories (name, description, slug) VALUES
('Flores Premium', 'Flores de cannabis de alta qualidade', 'flores-premium'),
('Extrações Ice', 'Extrações feitas com gelo e água', 'extracoes-ice'),
('Extrações Dry', 'Extrações a seco sem solventes', 'extracoes-dry'),
('Prensados (PAC)', 'Prensados artesanais de qualidade', 'prensados-pac'),
('Resinas Live', 'Resinas extraídas de plantas frescas', 'resinas-live'),
('Sementes', 'Sementes de genéticas selecionadas', 'sementes')
ON CONFLICT (slug) DO NOTHING;

-- Inserir templates de genéticas famosas
INSERT INTO product_templates (name, description, category_id, genetics, strain_type, thc_level, cbd_level, effects, flavors, flowering_time, difficulty, yield, height, medical_uses, terpenes, grow_tips, base_price, image_url) VALUES
(
    'OG Kush',
    'Genética clássica californiana com efeitos relaxantes e sabor terroso',
    1,
    'Chemdawg x Lemon Thai x Pakistani Kush',
    'hybrid',
    '20-25%',
    '<1%',
    ARRAY['relaxante', 'eufórico', 'criativo', 'feliz'],
    ARRAY['terroso', 'pinho', 'limão', 'diesel'],
    '8-9 semanas',
    'medium',
    '400-500g/m²',
    '90-160cm',
    ARRAY['ansiedade', 'estresse', 'dor', 'insônia'],
    ARRAY['limoneno', 'mirceno', 'cariofileno'],
    ARRAY['Controle de umidade importante', 'Boa ventilação', 'Suporte para galhos'],
    45.00,
    '/placeholder.svg?height=400&width=400&text=OG+Kush'
),
(
    'White Widow',
    'Híbrida holandesa famosa mundialmente, coberta de tricomas brancos',
    1,
    'Brazilian Sativa x South Indian Indica',
    'hybrid',
    '18-25%',
    '<1%',
    ARRAY['energético', 'criativo', 'eufórico', 'focado'],
    ARRAY['terroso', 'amadeirado', 'pinho', 'doce'],
    '8-9 semanas',
    'easy',
    '450-550g/m²',
    '60-100cm',
    ARRAY['depressão', 'fadiga', 'estresse', 'dor'],
    ARRAY['mirceno', 'limoneno', 'pineno'],
    ARRAY['Resistente a pragas', 'Fácil de cultivar', 'Boa para iniciantes'],
    40.00,
    '/placeholder.svg?height=400&width=400&text=White+Widow'
),
(
    'Amnesia Haze',
    'Sativa potente com efeitos cerebrais intensos e sabor cítrico',
    1,
    'Jamaican x Afghan x Laos x Hawaiian',
    'sativa',
    '20-25%',
    '<1%',
    ARRAY['energético', 'criativo', 'eufórico', 'cerebral'],
    ARRAY['cítrico', 'limão', 'terroso', 'doce'],
    '10-12 semanas',
    'hard',
    '600-700g/m²',
    '80-140cm',
    ARRAY['depressão', 'fadiga', 'estresse', 'TDAH'],
    ARRAY['limoneno', 'mirceno', 'cariofileno'],
    ARRAY['Precisa de espaço', 'Floração longa', 'Muita luz'],
    50.00,
    '/placeholder.svg?height=400&width=400&text=Amnesia+Haze'
),
(
    'Northern Lights',
    'Indica pura com efeitos relaxantes profundos e crescimento robusto',
    1,
    'Afghani x Thai',
    'indica',
    '16-21%',
    '<1%',
    ARRAY['relaxante', 'sedativo', 'feliz', 'sonolento'],
    ARRAY['doce', 'terroso', 'pinho', 'picante'],
    '6-7 semanas',
    'easy',
    '500-600g/m²',
    '100-120cm',
    ARRAY['insônia', 'dor', 'estresse', 'falta de apetite'],
    ARRAY['mirceno', 'cariofileno', 'pineno'],
    ARRAY['Muito resistente', 'Floração rápida', 'Ideal para indoor'],
    35.00,
    '/placeholder.svg?height=400&width=400&text=Northern+Lights'
),
(
    'Gorilla Glue #4',
    'Híbrida potente com alta produção de resina e efeitos intensos',
    1,
    'Chem Sister x Sour Dubb x Chocolate Diesel',
    'hybrid',
    '25-30%',
    '<1%',
    ARRAY['relaxante', 'eufórico', 'feliz', 'sedativo'],
    ARRAY['terroso', 'pinho', 'azedo', 'chocolate'],
    '8-9 semanas',
    'medium',
    '500-600g/m²',
    '60-80cm',
    ARRAY['dor', 'insônia', 'estresse', 'depressão'],
    ARRAY['cariofileno', 'limoneno', 'mirceno'],
    ARRAY['Muita resina', 'Galhos podem quebrar', 'Suporte necessário'],
    55.00,
    '/placeholder.svg?height=400&width=400&text=Gorilla+Glue'
)
ON CONFLICT DO NOTHING;

-- Função para atualizar status automaticamente quando estoque zerar
CREATE OR REPLACE FUNCTION update_product_status_on_stock_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o estoque chegou a zero e auto_deactivate está ativo
    IF NEW.stock_quantity = 0 AND NEW.auto_deactivate = true THEN
        NEW.status = 'out_of_stock';
    -- Se o estoque voltou a ter produtos e estava fora de estoque
    ELSIF NEW.stock_quantity > 0 AND OLD.status = 'out_of_stock' THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar status automaticamente
CREATE TRIGGER trigger_update_product_status
    BEFORE UPDATE OF stock_quantity ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_product_status_on_stock_change();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_templates_updated_at BEFORE UPDATE ON product_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

SELECT 'Cannabis marketplace database setup completed successfully!' as status;
