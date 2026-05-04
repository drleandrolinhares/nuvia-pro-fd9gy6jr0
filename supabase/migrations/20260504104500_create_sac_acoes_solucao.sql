CREATE TABLE IF NOT EXISTS public.sac_acoes_solucao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id UUID NOT NULL REFERENCES public.sac_demandas(id) ON DELETE CASCADE,
  data_acao DATE NOT NULL DEFAULT CURRENT_DATE,
  descricao TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.sac_acoes_solucao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sac_acoes_solucao_all" ON public.sac_acoes_solucao;
CREATE POLICY "sac_acoes_solucao_all" ON public.sac_acoes_solucao
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
DECLARE
  v_demanda RECORD;
BEGIN
  FOR v_demanda IN SELECT id, solucao FROM public.sac_demandas WHERE solucao IS NOT NULL AND solucao != '' LOOP
    IF NOT EXISTS (SELECT 1 FROM public.sac_acoes_solucao WHERE demanda_id = v_demanda.id) THEN
      INSERT INTO public.sac_acoes_solucao (demanda_id, data_acao, descricao)
      VALUES (v_demanda.id, CURRENT_DATE, v_demanda.solucao);
    END IF;
  END LOOP;
END $$;
