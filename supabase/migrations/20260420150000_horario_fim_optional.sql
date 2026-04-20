DO $$
BEGIN
  ALTER TABLE public.tarefas_rotina ALTER COLUMN horario_fim DROP NOT NULL;
END $$;
