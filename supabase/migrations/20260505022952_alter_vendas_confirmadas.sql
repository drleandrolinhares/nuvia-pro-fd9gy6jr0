DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'vendas_confirmadas' AND column_name = 'oportunidade_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.vendas_confirmadas ALTER COLUMN oportunidade_id DROP NOT NULL;
  END IF;
END $$;
