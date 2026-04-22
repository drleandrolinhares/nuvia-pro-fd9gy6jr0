CREATE TABLE IF NOT EXISTS public.terceiros_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tarefa_id UUID NOT NULL REFERENCES public.terceiros_tarefas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  detalhes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.terceiros_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "terceiros_historico_all" ON public.terceiros_historico;
CREATE POLICY "terceiros_historico_all" ON public.terceiros_historico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
