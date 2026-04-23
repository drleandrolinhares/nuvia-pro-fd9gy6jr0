-- Create performance_pp_pdm table
CREATE TABLE IF NOT EXISTS public.performance_pp_pdm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
  pontos_positivos TEXT NOT NULL,
  pontos_melhoria TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, data_registro)
);

-- Enable RLS for performance_pp_pdm
ALTER TABLE public.performance_pp_pdm ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_pp_pdm_all" ON public.performance_pp_pdm;
CREATE POLICY "performance_pp_pdm_all" ON public.performance_pp_pdm
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create performance_bonificacao table
CREATE TABLE IF NOT EXISTS public.performance_bonificacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mes_referencia TEXT NOT NULL,
  itens_marcados JSONB NOT NULL DEFAULT '[]'::jsonb,
  pontuacao_total INTEGER NOT NULL DEFAULT 0,
  atingiu_meta BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(usuario_id, mes_referencia)
);

-- Enable RLS for performance_bonificacao
ALTER TABLE public.performance_bonificacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "performance_bonificacao_all" ON public.performance_bonificacao;
CREATE POLICY "performance_bonificacao_all" ON public.performance_bonificacao
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
