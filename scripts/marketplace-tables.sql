-- Adicionar tabelas necessárias para o marketplace

-- Tabela de carrinho de compras
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- Tabela de tokens de recuperação de senha
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar campos ao usuário para perfil completo
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cart_items_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires ON password_reset_tokens(expires_at);

-- Trigger para atualizar updated_at no carrinho
CREATE TRIGGER update_cart_items_updated_at 
    BEFORE UPDATE ON cart_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir mais produtos de exemplo para o marketplace
INSERT INTO products (name, description, price, stock_quantity, category_id, user_id, slug, featured) VALUES
('MacBook Pro M3', 'MacBook Pro 14" com chip M3, 16GB RAM, 512GB SSD', 12999.00, 5, 1, 1, 'macbook-pro-m3', true),
('Samsung Galaxy S24', 'Smartphone Samsung Galaxy S24 256GB', 3999.00, 15, 1, 1, 'samsung-galaxy-s24', true),
('Jaqueta Jeans', 'Jaqueta jeans masculina, 100% algodão', 129.90, 25, 2, 1, 'jaqueta-jeans', false),
('Vestido Floral', 'Vestido feminino estampado, tecido leve', 89.90, 30, 2, 1, 'vestido-floral', false),
('Sofá 3 Lugares', 'Sofá confortável para sala, tecido suede', 899.90, 8, 3, 1, 'sofa-3-lugares', true),
('Mesa Jantar', 'Mesa de jantar 6 lugares, madeira maciça', 1299.90, 3, 3, 1, 'mesa-jantar', false),
('Bicicleta Mountain', 'Bicicleta mountain bike aro 29, 21 marchas', 899.90, 12, 4, 1, 'bicicleta-mountain', true),
('Kit Halteres', 'Kit de halteres ajustáveis 2-24kg', 299.90, 20, 4, 1, 'kit-halteres', false),
('Clean Code', 'Livro Clean Code - Robert C. Martin', 79.90, 50, 5, 1, 'clean-code', false),
('JavaScript Eloquente', 'Livro JavaScript Eloquente - 3ª Edição', 69.90, 40, 5, 1, 'javascript-eloquente', false)
ON CONFLICT (slug) DO NOTHING;

-- Inserir imagens de exemplo para os produtos
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
(1, '/placeholder.svg?height=400&width=400&text=iPhone+15+Pro', 'iPhone 15 Pro', true, 1),
(2, '/placeholder.svg?height=400&width=400&text=Camiseta', 'Camiseta Básica', true, 1),
(3, '/placeholder.svg?height=400&width=400&text=Mesa', 'Mesa de Centro', true, 1),
(4, '/placeholder.svg?height=400&width=400&text=Tênis', 'Tênis Running', true, 1),
(5, '/placeholder.svg?height=400&width=400&text=Livro', 'Livro JavaScript', true, 1)
ON CONFLICT DO NOTHING;

SELECT 'Tabelas do marketplace criadas com sucesso!' as status;
