-- create categorias
CREATE TABLE IF NOT EXISTS public.fluxo_caixa_categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.fluxo_caixa_categorias (nome) VALUES
  ('Fornecedores'),
  ('Impostos'),
  ('Folha de Pagamento'),
  ('Marketing'),
  ('Infraestrutura'),
  ('Laboratório'),
  ('Dentistas'),
  ('Outros')
ON CONFLICT (nome) DO NOTHING;

ALTER TABLE public.fluxo_caixa_categorias ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fluxo_caixa_categorias_all" ON public.fluxo_caixa_categorias;
CREATE POLICY "fluxo_caixa_categorias_all" ON public.fluxo_caixa_categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- create parceiros
CREATE TABLE IF NOT EXISTS public.fluxo_caixa_parceiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('dentista', 'laboratorio', 'outro')),
  nome TEXT NOT NULL,
  data_vencimento DATE NOT NULL,
  valor NUMERIC NOT NULL DEFAULT 0,
  descricao TEXT,
  status TEXT DEFAULT 'pendente',
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.fluxo_caixa_parceiros ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fluxo_caixa_parceiros_all" ON public.fluxo_caixa_parceiros;
CREATE POLICY "fluxo_caixa_parceiros_all" ON public.fluxo_caixa_parceiros FOR ALL TO authenticated USING (true) WITH CHECK (true);
