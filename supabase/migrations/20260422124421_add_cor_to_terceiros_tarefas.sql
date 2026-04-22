DO $$
BEGIN
  ALTER TABLE public.terceiros_tarefas ADD COLUMN IF NOT EXISTS cor TEXT DEFAULT 'border-slate-700';
END $$;
