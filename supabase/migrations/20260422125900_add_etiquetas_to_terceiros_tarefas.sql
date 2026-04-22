DO $$
BEGIN
  ALTER TABLE public.terceiros_tarefas ADD COLUMN IF NOT EXISTS etiquetas JSONB DEFAULT '[]'::jsonb;
END $$;
