-- Script para corrigir a coluna de senha baseado na estrutura atual
BEGIN;

-- Verificar se a coluna password_hash existe
DO $$
BEGIN
    -- Se password_hash existe e password não tem dados, copiar
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        -- Copiar dados de password_hash para password onde password é null
        UPDATE users 
        SET password = password_hash 
        WHERE password IS NULL AND password_hash IS NOT NULL;
        
        -- Remover coluna password_hash
        ALTER TABLE users DROP COLUMN password_hash;
        
        RAISE NOTICE 'Copied data from password_hash to password and dropped password_hash column';
    END IF;
    
    -- Se ainda há registros com password null, precisamos lidar com isso
    IF EXISTS (SELECT 1 FROM users WHERE password IS NULL) THEN
        -- Deletar registros sem senha (se houver)
        DELETE FROM users WHERE password IS NULL;
        RAISE NOTICE 'Deleted users without password';
    END IF;
    
    -- Tornar password NOT NULL se ainda não for
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password' AND is_nullable = 'YES') THEN
        ALTER TABLE users ALTER COLUMN password SET NOT NULL;
        RAISE NOTICE 'Set password column to NOT NULL';
    END IF;
END $$;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('password', 'password_hash')
ORDER BY column_name;

SELECT 'Password column fixed successfully!' as status;

COMMIT;
