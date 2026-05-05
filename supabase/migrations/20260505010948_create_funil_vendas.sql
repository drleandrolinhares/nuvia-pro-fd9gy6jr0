DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.funil_origens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL UNIQUE,
    ativo boolean NOT NULL DEFAULT true,
    ordem integer NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.funil_dados_mensais (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    origem_id uuid NOT NULL REFERENCES public.funil_origens(id) ON DELETE CASCADE,
    mes_referencia text NOT NULL,
    investimento numeric NOT NULL DEFAULT 0,
    meta_leads integer NOT NULL DEFAULT 0,
    leads_realizado integer NOT NULL DEFAULT 0,
    meta_agendamentos_qtde integer NOT NULL DEFAULT 0,
    meta_agendamentos_perc numeric NOT NULL DEFAULT 0,
    agendamentos_realizado integer NOT NULL DEFAULT 0,
    meta_comparecimentos_qtde integer NOT NULL DEFAULT 0,
    meta_comparecimentos_perc numeric NOT NULL DEFAULT 0,
    comparecimentos_realizado integer NOT NULL DEFAULT 0,
    meta_fechamento_valor numeric NOT NULL DEFAULT 0,
    ticket_medio_esperado numeric NOT NULL DEFAULT 0,
    fechamentos_qtde_realizado integer NOT NULL DEFAULT 0,
    fechamentos_valor_realizado numeric NOT NULL DEFAULT 0,
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now(),
    UNIQUE(origem_id, mes_referencia)
  );

  -- RLS
  ALTER TABLE public.funil_origens ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.funil_dados_mensais ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "funil_origens_all" ON public.funil_origens;
  CREATE POLICY "funil_origens_all" ON public.funil_origens FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "funil_dados_mensais_all" ON public.funil_dados_mensais;
  CREATE POLICY "funil_dados_mensais_all" ON public.funil_dados_mensais FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- Insert defaults
  INSERT INTO public.funil_origens (nome, ordem) VALUES
    ('Facebook TP - tráfego pago', 1),
    ('Instagram', 2),
    ('Campanha Sorriso dos Sonhos VPI', 3),
    ('Google', 4)
  ON CONFLICT (nome) DO NOTHING;

  INSERT INTO public.permissoes (nome, descricao, modulo) VALUES
    ('comercial_funil', 'Acessar Funil de Vendas', 'Comercial')
  ON CONFLICT (nome) DO NOTHING;
END $$;
