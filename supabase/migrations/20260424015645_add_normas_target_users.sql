ALTER TABLE public.normas_internas 
ADD COLUMN IF NOT EXISTS todos_usuarios BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS usuarios_alvo JSONB DEFAULT '[]'::jsonb;
