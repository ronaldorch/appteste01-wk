-- Consolidar colunas de senha na tabela users
-- Copiar dados de password_hash para password e remover password_hash

BEGIN;

-- Primeiro, copiar dados de password_hash para password onde password é null
UPDATE users 
SET password = password_hash 
WHERE password IS NULL AND password_hash IS NOT NULL;

-- Verificar se todos os registros têm password preenchido
SELECT 
    COUNT(*) as total_users,
    COUNT(password) as users_with_password,
    COUNT(password_hash) as users_with_password_hash
FROM users;

-- Remover a coluna password_hash (não precisamos mais dela)
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Tornar a coluna password NOT NULL
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('password', 'password_hash')
ORDER BY column_name;

SELECT 'Password columns consolidated successfully!' as status;

COMMIT;
