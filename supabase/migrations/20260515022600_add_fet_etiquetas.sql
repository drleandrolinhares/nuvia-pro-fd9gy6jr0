CREATE TABLE IF NOT EXISTS public.fet_etiquetas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cor text NOT NULL DEFAULT '#3b82f6',
  criado_em timestamptz NOT NULL DEFAULT now(),
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE DEFAULT public.get_my_tenant_id()
);

ALTER TABLE public.fet_etiquetas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fet_etiquetas_select" ON public.fet_etiquetas;
CREATE POLICY "fet_etiquetas_select" ON public.fet_etiquetas
  FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "fet_etiquetas_insert" ON public.fet_etiquetas;
CREATE POLICY "fet_etiquetas_insert" ON public.fet_etiquetas
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "fet_etiquetas_update" ON public.fet_etiquetas;
CREATE POLICY "fet_etiquetas_update" ON public.fet_etiquetas
  FOR UPDATE TO authenticated USING (tenant_id = public.get_my_tenant_id());

DROP POLICY IF EXISTS "fet_etiquetas_delete" ON public.fet_etiquetas;
CREATE POLICY "fet_etiquetas_delete" ON public.fet_etiquetas
  FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id());

ALTER TABLE public.fet_procedimentos ADD COLUMN IF NOT EXISTS etiquetas jsonb DEFAULT '[]'::jsonb;
