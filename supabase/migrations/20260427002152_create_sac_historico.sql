CREATE TABLE IF NOT EXISTS public.sac_historico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID REFERENCES public.sac_demandas(id) ON DELETE CASCADE NOT NULL,
  usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  acao TEXT NOT NULL,
  detalhes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sac_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sac_historico_all" ON public.sac_historico;
CREATE POLICY "sac_historico_all" ON public.sac_historico
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
