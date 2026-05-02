CREATE TABLE IF NOT EXISTS public.precificacao_especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  data_criacao TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.precificacao_especialidades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_especialidades_all" ON public.precificacao_especialidades;
CREATE POLICY "precificacao_especialidades_all" ON public.precificacao_especialidades
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  INSERT INTO public.precificacao_especialidades (id, nome, data_criacao)
  SELECT id, nome, data_criacao FROM public.especialidades
  ON CONFLICT (id) DO NOTHING;
END $$;

ALTER TABLE public.precificacao_procedimentos 
  DROP CONSTRAINT IF EXISTS precificacao_procedimentos_especialidade_id_fkey;

ALTER TABLE public.precificacao_procedimentos 
  ADD CONSTRAINT precificacao_procedimentos_especialidade_id_fkey 
  FOREIGN KEY (especialidade_id) REFERENCES public.precificacao_especialidades(id) ON DELETE CASCADE;
