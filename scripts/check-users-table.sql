-- Verificar estrutura atual da tabela users
\d users;

-- Verificar dados existentes
SELECT 
    id, 
    name, 
    email, 
    CASE WHEN password IS NOT NULL THEN 'HAS_PASSWORD' ELSE 'NO_PASSWORD' END as password_status,
    CASE WHEN password_hash IS NOT NULL THEN 'HAS_PASSWORD_HASH' ELSE 'NO_PASSWORD_HASH' END as password_hash_status,
    role,
    created_at
FROM users 
LIMIT 5;

-- Contar registros
SELECT COUNT(*) as total_users FROM users;
