DO $$
BEGIN
  ALTER TABLE public.tarefas_rotina ADD COLUMN IF NOT EXISTS periodicidade text NOT NULL DEFAULT 'diaria';
  ALTER TABLE public.tarefas_rotina ADD COLUMN IF NOT EXISTS dias_semana jsonb DEFAULT NULL;
  ALTER TABLE public.tarefas_rotina ADD COLUMN IF NOT EXISTS dia_mes integer DEFAULT NULL;
  ALTER TABLE public.tarefas_rotina ADD COLUMN IF NOT EXISTS data_inicio_contagem date DEFAULT NULL;
END $$;
