-- Update is_tenant_admin function to use ILIKE instead of unaccent_string lower match
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
        WHERE up.usuario_id = auth.uid() AND (up.tenant_id = v_tenant_id OR up.tenant_id IS NULL)
        AND public.unaccent_string(p.nome) ILIKE '%parametros gerais%'
    ) INTO v_has_perm;

    IF v_has_perm THEN RETURN true; END IF;

    -- Check if user's cargo has 'Acessar Parâmetros Gerais' permission
    SELECT EXISTS (
        SELECT 1 FROM public.cargo_permissoes cp
        JOIN public.usuarios u ON u.cargo_id = cp.cargo_id OR u.cargo_secundario_id = cp.cargo_id
        JOIN public.permissoes p ON p.id = cp.permissao_id
        WHERE u.id = auth.uid() AND (u.tenant_id = v_tenant_id OR u.tenant_id IS NULL)
        AND public.unaccent_string(p.nome) ILIKE '%parametros gerais%'
    ) INTO v_has_perm;

    RETURN v_has_perm;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_tenant_id uuid;
    v_cargo_id  uuid;
    v_cargo_sec_id uuid;
    v_has_perm  boolean := false;
    v_status text;
BEGIN
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;

    SELECT status, cargo_id, cargo_secundario_id INTO v_status, v_cargo_id, v_cargo_sec_id
    FROM public.usuarios WHERE id = auth.uid() AND (tenant_id = v_tenant_id OR tenant_id IS NULL);

    IF v_status = 'inativo' THEN RETURN false; END IF;

    IF public.is_tenant_admin() THEN RETURN true; END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.usuario_permissoes up
        JOIN public.permissoes p ON p.id = up.permissao_id
        WHERE up.usuario_id = auth.uid() AND (up.tenant_id = v_tenant_id OR up.tenant_id IS NULL)
          AND public.unaccent_string(p.nome) ILIKE public.unaccent_string(permission_name)
    ) INTO v_has_perm;
    IF v_has_perm THEN RETURN true; END IF;

    IF v_cargo_id IS NOT NULL OR v_cargo_sec_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.cargo_permissoes cp
            JOIN public.permissoes p ON p.id = cp.permissao_id
            WHERE cp.cargo_id IN (v_cargo_id, v_cargo_sec_id) AND (cp.tenant_id = v_tenant_id OR cp.tenant_id IS NULL)
              AND public.unaccent_string(p.nome) ILIKE public.unaccent_string(permission_name)
        ) INTO v_has_perm;
    END IF;
    
    RETURN v_has_perm;
END;
$function$;
