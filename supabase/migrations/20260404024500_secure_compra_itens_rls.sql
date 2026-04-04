-- Secure compra_itens to ensure only authorized users can mutate
DROP POLICY IF EXISTS "compra_itens_all" ON public.compra_itens;

CREATE POLICY "compra_itens_read" ON public.compra_itens
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "compra_itens_insert" ON public.compra_itens
  FOR INSERT TO authenticated WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

CREATE POLICY "compra_itens_update" ON public.compra_itens
  FOR UPDATE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque')) WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'));

CREATE POLICY "compra_itens_delete" ON public.compra_itens
  FOR DELETE TO authenticated USING (is_admin() OR has_permission('Gerenciar Estoque'));
