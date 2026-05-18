CREATE TABLE IF NOT EXISTS public.intranet_onboarding_fases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    ordem INT NOT NULL DEFAULT 0,
    cargo_id UUID REFERENCES public.cargos(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id(),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.intranet_onboarding_fases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_iof" ON public.intranet_onboarding_fases;
CREATE POLICY "authenticated_all_iof" ON public.intranet_onboarding_fases
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.intranet_onboarding_etapas 
ADD COLUMN IF NOT EXISTS fase_id UUID REFERENCES public.intranet_onboarding_fases(id) ON DELETE CASCADE;
