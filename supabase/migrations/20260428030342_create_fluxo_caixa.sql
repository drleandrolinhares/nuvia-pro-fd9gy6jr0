DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.fluxo_caixa_receitas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mes_referencia TEXT NOT NULL,
      ciclo INTEGER NOT NULL,
      valor_estimado NUMERIC NOT NULL DEFAULT 0,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(mes_referencia, ciclo)
  );

  CREATE TABLE IF NOT EXISTS public.fluxo_caixa_despesas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      data_vencimento DATE NOT NULL,
      categoria TEXT NOT NULL,
      valor_estimado NUMERIC NOT NULL DEFAULT 0,
      descricao TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END $$;

ALTER TABLE public.fluxo_caixa_receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fluxo_caixa_despesas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fluxo_caixa_receitas_all" ON public.fluxo_caixa_receitas;
CREATE POLICY "fluxo_caixa_receitas_all" ON public.fluxo_caixa_receitas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "fluxo_caixa_despesas_all" ON public.fluxo_caixa_despesas;
CREATE POLICY "fluxo_caixa_despesas_all" ON public.fluxo_caixa_despesas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
