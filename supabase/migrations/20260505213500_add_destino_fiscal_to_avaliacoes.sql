DO $$
BEGIN
  ALTER TABLE public.avaliacoes ADD COLUMN IF NOT EXISTS destino_fiscal text;
END $$;
