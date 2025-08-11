-- Verificar estrutura atual da tabela users
\d users;

-- Corrigir estrutura da tabela users
-- Opção 1: Se a coluna password_hash existe e password não
DO $$ 
BEGIN
    -- Verificar se a coluna password existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'users' AND column_name = 'password') THEN
        -- Se password existe, remover password_hash se existir
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash') THEN
            ALTER TABLE users DROP COLUMN password_hash;
        END IF;
    ELSE
        -- Se password não existe, renomear password_hash para password
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'password_hash') THEN
            ALTER TABLE users RENAME COLUMN password_hash TO password;
        ELSE
            -- Adicionar coluna password se não existir
            ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '';
        END IF;
    END IF;
END $$;

-- Garantir que a coluna password existe e é NOT NULL
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Users table structure fixed!' as status;
