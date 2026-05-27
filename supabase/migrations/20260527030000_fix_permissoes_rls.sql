DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes 
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "cargo_permissoes_select" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_select" ON public.cargo_permissoes 
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "usuario_permissoes_select" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_select" ON public.usuario_permissoes 
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());

DROP POLICY IF EXISTS "cargos_select" ON public.cargos;
CREATE POLICY "cargos_select" ON public.cargos 
  FOR SELECT TO authenticated 
  USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());
