DO $$
DECLARE
  v_user record;
  v_cargo record;
BEGIN
  -- Assign all permissions to users who currently have role = 'admin' or similar admin roles
  FOR v_user IN 
    SELECT id, tenant_id FROM public.usuarios 
    WHERE role IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor')
  LOOP
    INSERT INTO public.usuario_permissoes (usuario_id, permissao_id, tenant_id)
    SELECT v_user.id, p.id, v_user.tenant_id
    FROM public.permissoes p
    ON CONFLICT DO NOTHING;
  END LOOP;
  
  -- Assign all permissions to cargos that act as admins
  FOR v_cargo IN 
    SELECT id, tenant_id FROM public.cargos 
    WHERE public.unaccent_string(lower(nome)) IN ('admin', 'adm', 'administrador', 'administradora', 'ceo', 'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora')
  LOOP
    INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
    SELECT v_cargo.id, p.id, v_cargo.tenant_id
    FROM public.permissoes p
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_tenant_id uuid;
    v_has_perm boolean;
BEGIN
    -- Super admin check
    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false) THEN
        RETURN true;
    END IF;

    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;

    -- Check if user has explicit 'Acessar Parâmetros Gerais' permission
    SELECT EXISTS (
        SELECT 1 FROM public.usuario_permissoes up
        JOIN public.permissoes p ON p.id = up.permissao_id
        WHERE up.usuario_id = auth.uid() AND up.tenant_id = v_tenant_id
        AND public.unaccent_string(lower(p.nome)) = 'acessar parametros gerais'
    ) INTO v_has_perm;

    IF v_has_perm THEN RETURN true; END IF;

    -- Check if user's cargo has 'Acessar Parâmetros Gerais' permission
    SELECT EXISTS (
        SELECT 1 FROM public.cargo_permissoes cp
        JOIN public.usuarios u ON u.cargo_id = cp.cargo_id OR u.cargo_secundario_id = cp.cargo_id
        JOIN public.permissoes p ON p.id = cp.permissao_id
        WHERE u.id = auth.uid() AND u.tenant_id = v_tenant_id
        AND public.unaccent_string(lower(p.nome)) = 'acessar parametros gerais'
    ) INTO v_has_perm;

    RETURN v_has_perm;
END;
$function$;

-- Update RLS policies to make sure administrators can manage permissions
DROP POLICY IF EXISTS "cargo_permissoes_delete" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_delete" ON public.cargo_permissoes
  FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin());
  
DROP POLICY IF EXISTS "cargo_permissoes_insert" ON public.cargo_permissoes;
CREATE POLICY "cargo_permissoes_insert" ON public.cargo_permissoes
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin());
  
DROP POLICY IF EXISTS "usuario_permissoes_delete" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_delete" ON public.usuario_permissoes
  FOR DELETE TO authenticated USING (tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin());
  
DROP POLICY IF EXISTS "usuario_permissoes_insert" ON public.usuario_permissoes;
CREATE POLICY "usuario_permissoes_insert" ON public.usuario_permissoes
  FOR INSERT TO authenticated WITH CHECK (tenant_id = public.get_my_tenant_id() AND public.is_tenant_admin());
  
DROP POLICY IF EXISTS "permissoes_select" ON public.permissoes;
CREATE POLICY "permissoes_select" ON public.permissoes
  FOR SELECT TO authenticated USING (tenant_id = public.get_my_tenant_id() OR tenant_id IS NULL OR public.is_super_admin());
