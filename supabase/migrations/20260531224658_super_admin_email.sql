-- Update is_super_admin to check for the specific email
CREATE OR REPLACE FUNCTION public.is_super_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
    SELECT COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false) OR (auth.jwt() ->> 'email') = 'drleandrolinhares@gmail.com';
$function$;

-- Update is_tenant_admin to use the updated is_super_admin
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
    IF public.is_super_admin() THEN
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

-- Update has_permission to bypass everything for super admin
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
    -- Super Admin bypasses everything
    IF public.is_super_admin() THEN 
        RETURN true; 
    END IF;

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

-- Update get_user_permissions to grant all permissions to super admin
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_perms text[];
  v_is_super boolean := false;
BEGIN
  -- Check if user is super admin
  SELECT (COALESCE((raw_app_meta_data->>'is_super_admin')::boolean, false) OR email = 'drleandrolinhares@gmail.com')
  INTO v_is_super
  FROM auth.users
  WHERE id = p_user_id;

  IF v_is_super THEN
    SELECT array_agg(DISTINCT nome) INTO v_perms FROM public.permissoes;
    RETURN COALESCE(v_perms, ARRAY[]::text[]);
  END IF;

  SELECT array_agg(DISTINCT p.nome) INTO v_perms
  FROM public.permissoes p
  WHERE p.id IN (
    SELECT up.permissao_id
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = p_user_id
    UNION
    SELECT cp.permissao_id
    FROM public.cargo_permissoes cp
    JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    WHERE u.id = p_user_id
  );
  
  RETURN COALESCE(v_perms, ARRAY[]::text[]);
END;
$function$;

-- Update get_user_consolidated_permissions to grant all permissions to super admin
CREATE OR REPLACE FUNCTION public.get_user_consolidated_permissions(p_user_id uuid)
 RETURNS TABLE(id uuid, nome text, modulo text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  v_is_super boolean := false;
BEGIN
  SELECT (COALESCE((raw_app_meta_data->>'is_super_admin')::boolean, false) OR email = 'drleandrolinhares@gmail.com')
  INTO v_is_super
  FROM auth.users
  WHERE id = p_user_id;

  IF v_is_super THEN
    RETURN QUERY SELECT p.id, p.nome, p.modulo FROM public.permissoes p;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT DISTINCT p.id, p.nome, p.modulo
  FROM public.permissoes p
  WHERE p.id IN (
    SELECT up.permissao_id
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = p_user_id
    UNION
    SELECT cp.permissao_id
    FROM public.cargo_permissoes cp
    JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    WHERE u.id = p_user_id
  );
END;
$function$;

DO $$
DECLARE
  v_user_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Try to find the user first
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
  
  -- If not found, create
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass123', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"], "is_super_admin": true}',
      '{"name": "Leandro Linhares"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    -- Update existing user's app_metadata to ensure is_super_admin is true
    UPDATE auth.users 
    SET raw_app_meta_data = CASE 
          WHEN raw_app_meta_data IS NULL THEN '{"is_super_admin": true}'::jsonb 
          ELSE raw_app_meta_data || '{"is_super_admin": true}'::jsonb 
        END,
        is_super_admin = true
    WHERE id = v_user_id;
  END IF;

  -- Get the first tenant_id to associate, or default to null
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;

  -- Ensure in public.usuarios
  INSERT INTO public.usuarios (
    id, email, nome, status, role, tenant_id, possui_carteira
  ) VALUES (
    v_user_id, 'drleandrolinhares@gmail.com', 'Leandro Linhares', 'ativo', 'MASTER', v_tenant_id, true
  ) ON CONFLICT (id) DO UPDATE SET 
    status = 'ativo',
    role = 'MASTER';
END $$;
