-- Criar tabela de usuários se não existir
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar índice no email para performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Inserir usuário admin padrão se não existir
INSERT INTO users (name, email, password, role) 
SELECT 'Admin', 'admin@estacaofumaca.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9u2', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@estacaofumaca.com');

-- Verificar se a tabela foi criada
SELECT 'Tabela users criada com sucesso!' as status;
SELECT COUNT(*) as total_users FROM users;
