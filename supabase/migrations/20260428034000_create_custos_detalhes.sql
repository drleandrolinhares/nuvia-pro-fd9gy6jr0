CREATE TABLE IF NOT EXISTS public.precificacao_custos_fixos_detalhes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custo_fixo_id UUID NOT NULL REFERENCES public.precificacao_custos_fixos(id) ON DELETE CASCADE,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.precificacao_custos_fixos_detalhes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "precificacao_custos_fixos_detalhes_all" ON public.precificacao_custos_fixos_detalhes;
CREATE POLICY "precificacao_custos_fixos_detalhes_all" ON public.precificacao_custos_fixos_detalhes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
