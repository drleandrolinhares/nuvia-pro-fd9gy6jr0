CREATE TABLE IF NOT EXISTS public.pro_agenda_dentistas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

DO $$
BEGIN
  -- Insert existing dentists into pro_agenda_dentistas to preserve FK for existing data
  INSERT INTO public.pro_agenda_dentistas (id, nome, status, criado_em, atualizado_em)
  SELECT id, nome, COALESCE(status, 'ativo'), COALESCE(criado_em, NOW()), COALESCE(atualizado_em, NOW())
  FROM public.dentistas
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop the existing FK constraint from pro_agenda_tempos
ALTER TABLE public.pro_agenda_tempos DROP CONSTRAINT IF EXISTS pro_agenda_tempos_dentista_id_fkey;

-- Add the new constraint
ALTER TABLE public.pro_agenda_tempos
  ADD CONSTRAINT pro_agenda_tempos_dentista_id_fkey
  FOREIGN KEY (dentista_id) REFERENCES public.pro_agenda_dentistas(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.pro_agenda_dentistas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pro_agenda_dentistas_all" ON public.pro_agenda_dentistas;
CREATE POLICY "pro_agenda_dentistas_all" ON public.pro_agenda_dentistas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
