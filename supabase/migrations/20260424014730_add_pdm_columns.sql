DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_pp_pdm' AND column_name='nota_pdm') THEN
    ALTER TABLE public.performance_pp_pdm ADD COLUMN nota_pdm integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='performance_pp_pdm' AND column_name='pdm_itens') THEN
    ALTER TABLE public.performance_pp_pdm ADD COLUMN pdm_itens jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
