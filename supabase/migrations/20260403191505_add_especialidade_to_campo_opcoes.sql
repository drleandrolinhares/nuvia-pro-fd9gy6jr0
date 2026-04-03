DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campo_opcoes' AND column_name = 'especialidade_id'
  ) THEN
    ALTER TABLE public.campo_opcoes ADD COLUMN especialidade_id UUID REFERENCES public.especialidades(id) ON DELETE CASCADE;
  END IF;
END $$;
