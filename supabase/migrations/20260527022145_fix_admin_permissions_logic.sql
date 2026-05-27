-- Atualiza a função is_tenant_admin para incluir 'adm' como role de admin e verificar cargos
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_role      text;
    v_cargo_id  uuid;
    v_cargo_sec_id uuid;
    v_cargo_nome text;
    v_cargo_sec_nome text;
    v_tenant_id uuid;
BEGIN
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;
    
    SELECT role, cargo_id, cargo_secundario_id INTO v_role, v_cargo_id, v_cargo_sec_id
    FROM public.usuarios
    WHERE id = auth.uid() AND tenant_id = v_tenant_id;
    
    IF LOWER(public.unaccent_string(v_role)) IN (
      'admin', 'adm', 'administrador', 'administradora', 'ceo', 
      'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora'
    ) THEN
      RETURN true;
    END IF;

    IF v_cargo_id IS NOT NULL THEN
      SELECT nome INTO v_cargo_nome FROM public.cargos WHERE id = v_cargo_id AND tenant_id = v_tenant_id;
      IF LOWER(public.unaccent_string(v_cargo_nome)) IN (
        'admin', 'adm', 'administrador', 'administradora', 'ceo', 
        'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora'
      ) THEN
        RETURN true;
      END IF;
    END IF;

    IF v_cargo_sec_id IS NOT NULL THEN
      SELECT nome INTO v_cargo_sec_nome FROM public.cargos WHERE id = v_cargo_sec_id AND tenant_id = v_tenant_id;
      IF LOWER(public.unaccent_string(v_cargo_sec_nome)) IN (
        'admin', 'adm', 'administrador', 'administradora', 'ceo', 
        'socio', 'socia', 'gestor', 'gestora', 'diretor', 'diretora'
      ) THEN
        RETURN true;
      END IF;
    END IF;

    RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback simple check if unaccent_string fails
    IF LOWER(v_role) IN ('admin', 'adm', 'administrador', 'ceo', 'socio', 'gestor', 'diretor') THEN
      RETURN true;
    END IF;
    RETURN false;
END;
$function$;

-- Atualiza a função has_permission para usar unaccent_string para maior consistência
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_tenant_id uuid;
    v_cargo_id  uuid;
    v_has_perm  boolean := false;
BEGIN
    IF public.is_tenant_admin() THEN RETURN true; END IF;
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.usuario_permissoes up
        JOIN public.permissoes p ON p.id = up.permissao_id
        WHERE up.usuario_id = auth.uid() AND up.tenant_id = v_tenant_id
          AND public.unaccent_string(LOWER(p.nome)) = public.unaccent_string(LOWER(permission_name)) AND p.tenant_id = v_tenant_id
    ) INTO v_has_perm;
    IF v_has_perm THEN RETURN true; END IF;

    SELECT cargo_id INTO v_cargo_id
    FROM public.usuarios WHERE id = auth.uid() AND tenant_id = v_tenant_id;

    IF v_cargo_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.cargo_permissoes cp
            JOIN public.permissoes p ON p.id = cp.permissao_id
            WHERE cp.cargo_id = v_cargo_id AND cp.tenant_id = v_tenant_id
              AND public.unaccent_string(LOWER(p.nome)) = public.unaccent_string(LOWER(permission_name)) AND p.tenant_id = v_tenant_id
        ) INTO v_has_perm;
    END IF;
    RETURN v_has_perm;
END;
$function$;
