DO $$
BEGIN
  ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS url TEXT;
  ALTER TABLE public.fornecedores ADD COLUMN IF NOT EXISTS senha TEXT;
END $$;
