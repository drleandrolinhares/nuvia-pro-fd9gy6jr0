CREATE TABLE IF NOT EXISTS public.compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
  data DATE NOT NULL,
  nfe TEXT,
  valor_total_compra NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente',
  data_criacao TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.compras ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "compras_delete" ON public.compras;
CREATE POLICY "compras_delete" ON public.compras
  FOR DELETE TO authenticated USING ((is_admin() OR has_permission('Gerenciar Estoque'::text)));

DROP POLICY IF EXISTS "compras_insert" ON public.compras;
CREATE POLICY "compras_insert" ON public.compras
  FOR INSERT TO authenticated WITH CHECK ((is_admin() OR has_permission('Gerenciar Estoque'::text)));

DROP POLICY IF EXISTS "compras_read" ON public.compras;
CREATE POLICY "compras_read" ON public.compras
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "compras_update" ON public.compras;
CREATE POLICY "compras_update" ON public.compras
  FOR UPDATE TO authenticated USING ((is_admin() OR has_permission('Gerenciar Estoque'::text))) WITH CHECK ((is_admin() OR has_permission('Gerenciar Estoque'::text)));

CREATE INDEX IF NOT EXISTS compras_fornecedor_id_idx ON public.compras USING btree (fornecedor_id);
