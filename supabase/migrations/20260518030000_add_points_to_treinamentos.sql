DO $$
BEGIN
  ALTER TABLE public.intranet_treinamentos_progresso ADD COLUMN IF NOT EXISTS pontos INTEGER NOT NULL DEFAULT 0;
END $$;
