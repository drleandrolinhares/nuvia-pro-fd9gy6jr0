CREATE TABLE IF NOT EXISTS public.gestao_fiscal_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faturamento_previsto NUMERIC NOT NULL DEFAULT 0,
    pf_despesa NUMERIC NOT NULL DEFAULT 0,
    pf_receita NUMERIC NOT NULL DEFAULT 0,
    pf_imposto_perc NUMERIC NOT NULL DEFAULT 0,
    pj1_titulo TEXT NOT NULL DEFAULT 'PJ 01',
    pj1_despesa_folha NUMERIC NOT NULL DEFAULT 0,
    pj1_margem_perc NUMERIC NOT NULL DEFAULT 30,
    pj1_receita NUMERIC NOT NULL DEFAULT 0,
    pj1_imposto_perc NUMERIC NOT NULL DEFAULT 0,
    pj2_titulo TEXT NOT NULL DEFAULT 'EXCEDENTE (PJ 02)',
    pj2_imposto_perc NUMERIC NOT NULL DEFAULT 0,
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gestao_fiscal_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gestao_fiscal_config_all" ON public.gestao_fiscal_config;
CREATE POLICY "gestao_fiscal_config_all" ON public.gestao_fiscal_config
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.gestao_fiscal_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.gestao_fiscal_config);
