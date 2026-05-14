CREATE TABLE IF NOT EXISTS public.terceiros_etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cor TEXT NOT NULL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id()
);

ALTER TABLE public.terceiros_etiquetas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "terceiros_etiquetas_select" ON public.terceiros_etiquetas;
CREATE POLICY "terceiros_etiquetas_select" ON public.terceiros_etiquetas
  FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "terceiros_etiquetas_insert" ON public.terceiros_etiquetas;
CREATE POLICY "terceiros_etiquetas_insert" ON public.terceiros_etiquetas
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "terceiros_etiquetas_update" ON public.terceiros_etiquetas;
CREATE POLICY "terceiros_etiquetas_update" ON public.terceiros_etiquetas
  FOR UPDATE TO authenticated USING (tenant_id = public.get_my_tenant_id()) WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "terceiros_etiquetas_delete" ON public.terceiros_etiquetas;
CREATE POLICY "terceiros_etiquetas_delete" ON public.terceiros_etiquetas
  FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id());
