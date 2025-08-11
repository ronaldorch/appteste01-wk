-- Verificar estrutura atual da tabela users
\d users;

-- Mostrar todas as colunas e tipos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar dados existentes
SELECT COUNT(*) as total_users FROM users;
