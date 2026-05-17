DO $$
BEGIN
  ALTER TABLE public.compromissos ADD COLUMN IF NOT EXISTS setor text DEFAULT 'operacional';
  UPDATE public.compromissos SET setor = 'operacional' WHERE setor IS NULL;
END $$;
