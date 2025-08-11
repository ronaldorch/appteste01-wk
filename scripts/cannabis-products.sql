-- Atualizar produtos existentes com temática cannabis

-- Limpar produtos existentes
DELETE FROM product_images;
DELETE FROM products;
DELETE FROM categories;

-- Inserir categorias de cannabis
INSERT INTO categories (name, description, slug) VALUES
('Flores', 'Buds de cannabis premium de alta qualidade', 'flores'),
('Extrações', 'Concentrados, óleos e extratos de cannabis', 'extracoes');

-- Inserir produtos de flores (buds)
INSERT INTO products (name, description, price, stock_quantity, category_id, user_id, slug, featured) VALUES
-- Flores Premium
('Colombian Gold', 'Strain clássica colombiana, sativa pura com 22% THC. Efeito energético e cerebral intenso.', 45.00, 25, 1, 1, 'colombian-gold', true),
('Califa Kush', 'Indica premium da Califórnia, 24% THC. Relaxamento profundo e alívio do estresse.', 55.00, 18, 1, 1, 'califa-kush', true),
('Purple Haze', 'Híbrida lendária com 20% THC. Efeito balanceado entre relaxamento e euforia.', 50.00, 22, 1, 1, 'purple-haze', true),
('Green Crack', 'Sativa energética com 23% THC. Perfeita para o dia, aumenta foco e criatividade.', 48.00, 30, 1, 1, 'green-crack', false),
('OG Kush', 'Híbrida clássica com 21% THC. Efeito relaxante com toque de euforia.', 52.00, 20, 1, 1, 'og-kush', true),
('White Widow', 'Híbrida balanceada com 19% THC. Efeito equilibrado e duradouro.', 47.00, 28, 1, 1, 'white-widow', false),
('Sour Diesel', 'Sativa potente com 25% THC. Energia intensa e efeito cerebral marcante.', 58.00, 15, 1, 1, 'sour-diesel', true),
('Granddaddy Purple', 'Indica roxa premium com 23% THC. Relaxamento total e sono reparador.', 54.00, 12, 1, 1, 'granddaddy-purple', false),

-- Extrações
('Live Resin Colombian', 'Extrato live resin da Colombian Gold, 78% THC. Sabor e aroma preservados.', 120.00, 8, 2, 1, 'live-resin-colombian', true),
('Shatter Califa Kush', 'Shatter cristalino da Califa Kush, 82% THC. Pureza e potência máximas.', 135.00, 6, 2, 1, 'shatter-califa-kush', true),
('Rosin Purple Haze', 'Rosin prensado a frio da Purple Haze, 75% THC. Sem solventes, sabor natural.', 110.00, 10, 2, 1, 'rosin-purple-haze', false),
('Wax Green Crack', 'Wax cremoso da Green Crack, 80% THC. Textura suave e efeito potente.', 125.00, 7, 2, 1, 'wax-green-crack', true),
('Hash OG Kush', 'Hash tradicional da OG Kush, 65% THC. Método artesanal, sabor intenso.', 95.00, 12, 2, 1, 'hash-og-kush', false),
('Budder White Widow', 'Budder cremoso da White Widow, 77% THC. Consistência perfeita para dab.', 115.00, 9, 2, 1, 'budder-white-widow', false);

-- Inserir imagens dos produtos
INSERT INTO product_images (product_id, image_url, alt_text, is_primary, sort_order) VALUES
-- Flores
(1, '/placeholder.svg?height=400&width=400&text=🌿+Colombian+Gold', 'Colombian Gold Bud', true, 1),
(2, '/placeholder.svg?height=400&width=400&text=🍃+Califa+Kush', 'Califa Kush Bud', true, 1),
(3, '/placeholder.svg?height=400&width=400&text=💜+Purple+Haze', 'Purple Haze Bud', true, 1),
(4, '/placeholder.svg?height=400&width=400&text=💚+Green+Crack', 'Green Crack Bud', true, 1),
(5, '/placeholder.svg?height=400&width=400&text=🔥+OG+Kush', 'OG Kush Bud', true, 1),
(6, '/placeholder.svg?height=400&width=400&text=❄️+White+Widow', 'White Widow Bud', true, 1),
(7, '/placeholder.svg?height=400&width=400&text=⚡+Sour+Diesel', 'Sour Diesel Bud', true, 1),
(8, '/placeholder.svg?height=400&width=400&text=🍇+GDP', 'Granddaddy Purple Bud', true, 1),

-- Extrações
(9, '/placeholder.svg?height=400&width=400&text=🍯+Live+Resin', 'Live Resin Colombian', true, 1),
(10, '/placeholder.svg?height=400&width=400&text=💎+Shatter', 'Shatter Califa Kush', true, 1),
(11, '/placeholder.svg?height=400&width=400&text=🟫+Rosin', 'Rosin Purple Haze', true, 1),
(12, '/placeholder.svg?height=400&width=400&text=🧈+Wax', 'Wax Green Crack', true, 1),
(13, '/placeholder.svg?height=400&width=400&text=🟤+Hash', 'Hash OG Kush', true, 1),
(14, '/placeholder.svg?height=400&width=400&text=🥛+Budder', 'Budder White Widow', true, 1);

SELECT 'Produtos de cannabis inseridos com sucesso!' as status;
