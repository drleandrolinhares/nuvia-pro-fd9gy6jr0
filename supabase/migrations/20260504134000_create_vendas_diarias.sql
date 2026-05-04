CREATE TABLE IF NOT EXISTS public.vendas_diarias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_venda DATE NOT NULL UNIQUE,
  valor NUMERIC NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.vendas_diarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendas_diarias_all" ON public.vendas_diarias;
CREATE POLICY "vendas_diarias_all" ON public.vendas_diarias
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
