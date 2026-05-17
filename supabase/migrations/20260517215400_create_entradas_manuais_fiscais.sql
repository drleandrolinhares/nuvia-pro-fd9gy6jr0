CREATE TABLE IF NOT EXISTS public.gestao_fiscal_entradas_manuais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destino_fiscal TEXT NOT NULL,
    data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
    valor NUMERIC NOT NULL DEFAULT 0,
    mes_referencia TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    tenant_id UUID DEFAULT get_my_tenant_id()
);

ALTER TABLE public.gestao_fiscal_entradas_manuais ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "gestao_fiscal_entradas_manuais_select" ON public.gestao_fiscal_entradas_manuais;
CREATE POLICY "gestao_fiscal_entradas_manuais_select" ON public.gestao_fiscal_entradas_manuais
    FOR SELECT TO authenticated USING (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "gestao_fiscal_entradas_manuais_insert" ON public.gestao_fiscal_entradas_manuais;
CREATE POLICY "gestao_fiscal_entradas_manuais_insert" ON public.gestao_fiscal_entradas_manuais
    FOR INSERT TO authenticated WITH CHECK (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "gestao_fiscal_entradas_manuais_update" ON public.gestao_fiscal_entradas_manuais;
CREATE POLICY "gestao_fiscal_entradas_manuais_update" ON public.gestao_fiscal_entradas_manuais
    FOR UPDATE TO authenticated USING (tenant_id = get_my_tenant_id()) WITH CHECK (tenant_id = get_my_tenant_id());

DROP POLICY IF EXISTS "gestao_fiscal_entradas_manuais_delete" ON public.gestao_fiscal_entradas_manuais;
CREATE POLICY "gestao_fiscal_entradas_manuais_delete" ON public.gestao_fiscal_entradas_manuais
    FOR DELETE TO authenticated USING (tenant_id = get_my_tenant_id());
