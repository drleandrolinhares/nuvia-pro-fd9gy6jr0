DO $$
BEGIN
  -- 1. configuracoes_negociacao
  CREATE TABLE IF NOT EXISTS public.configuracoes_negociacao (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      percentual_entrada_padrao NUMERIC NOT NULL DEFAULT 0,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. faixas_valores_parcelas
  CREATE TABLE IF NOT EXISTS public.faixas_valores_parcelas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      faixa_numero INTEGER,
      valor_minimo NUMERIC NOT NULL DEFAULT 0,
      valor_maximo NUMERIC NOT NULL,
      max_parcelas INTEGER NOT NULL DEFAULT 1,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 3. descontos_por_prazo
  CREATE TABLE IF NOT EXISTS public.descontos_por_prazo (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      faixa_numero INTEGER NOT NULL,
      percentual_desconto NUMERIC NOT NULL DEFAULT 0,
      descricao TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  
  -- Constraint for faixa_numero
  IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'descontos_por_prazo_faixa_numero_check'
  ) THEN
      ALTER TABLE public.descontos_por_prazo ADD CONSTRAINT descontos_por_prazo_faixa_numero_check CHECK (faixa_numero >= 0 AND faixa_numero <= 5);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.configuracoes_negociacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faixas_valores_parcelas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descontos_por_prazo ENABLE ROW LEVEL SECURITY;

-- Policies for configuracoes_negociacao
DROP POLICY IF EXISTS "configuracoes_negociacao_all" ON public.configuracoes_negociacao;
CREATE POLICY "configuracoes_negociacao_all" ON public.configuracoes_negociacao
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for faixas_valores_parcelas
DROP POLICY IF EXISTS "faixas_valores_parcelas_all" ON public.faixas_valores_parcelas;
CREATE POLICY "faixas_valores_parcelas_all" ON public.faixas_valores_parcelas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies for descontos_por_prazo
DROP POLICY IF EXISTS "descontos_por_prazo_all" ON public.descontos_por_prazo;
CREATE POLICY "descontos_por_prazo_all" ON public.descontos_por_prazo
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
