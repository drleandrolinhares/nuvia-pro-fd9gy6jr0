DO $$
BEGIN
  ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS contato_principal TEXT;
  ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS observacoes TEXT;
END $$;
