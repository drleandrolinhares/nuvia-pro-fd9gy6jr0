-- Ensure is_admin() robustly recognizes admin roles including cargo-based checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_role text;
  v_cargo_principal_nome text;
  v_cargo_secundario_nome text;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;

  -- Check JWT metadata for super admin
  BEGIN
    IF COALESCE((auth.jwt() -> 'app_metadata' ->> 'is_super_admin')::boolean, false) THEN
      RETURN true;
    END IF;
    IF (auth.jwt() ->> 'email') = 'drleandrolinhares@gmail.com' THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  -- Check usuarios table for role and cargo names
  BEGIN
    SELECT LOWER(COALESCE(u.role, '')),
           LOWER(COALESCE(cp.nome, '')),
           LOWER(COALESCE(cs.nome, ''))
    INTO v_role, v_cargo_principal_nome, v_cargo_secundario_nome
    FROM public.usuarios u
    LEFT JOIN public.cargos cp ON u.cargo_id = cp.id
    LEFT JOIN public.cargos cs ON u.cargo_secundario_id = cs.id
    WHERE u.id = v_uid;

    IF v_role IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor', 'master') THEN
      RETURN true;
    END IF;
    IF v_cargo_principal_nome IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor') THEN
      RETURN true;
    END IF;
    IF v_cargo_secundario_nome IN ('admin', 'administrador', 'ceo', 'diretoria', 'diretor', 'gestor') THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN false;
END;
$$;

-- Ensure is_tenant_admin() delegates to is_admin()
CREATE OR REPLACE FUNCTION public.is_tenant_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN public.is_admin();
END;
$$;

-- Ensure is_active_user() checks user status
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND COALESCE(status, 'ativo') = 'ativo'
  );
$$;

-- Ensure get_user_permissions() returns all permissions for admins
DROP FUNCTION IF EXISTS public.get_user_permissions(uuid);
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid DEFAULT NULL)
RETURNS text[]
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user_id uuid := COALESCE(p_user_id, auth.uid());
  v_perms text[];
  v_adm boolean;
BEGIN
  IF v_user_id IS NULL THEN RETURN ARRAY[]::text[]; END IF;

  SELECT public.is_admin() INTO v_adm;
  IF v_adm THEN
    SELECT COALESCE(array_agg(DISTINCT nome), ARRAY[]::text[]) INTO v_perms
    FROM public.permissoes WHERE ativo = true;
    RETURN v_perms;
  END IF;

  BEGIN
    SELECT COALESCE(array_agg(DISTINCT perm_name), ARRAY[]::text[]) INTO v_perms
    FROM (
      SELECT p.nome AS perm_name FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = v_user_id AND p.ativo = true
      UNION
      SELECT p.nome AS perm_name FROM public.cargo_permissoes cp
      JOIN public.permissoes p ON cp.permissao_id = p.id
      JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
      WHERE u.id = v_user_id AND p.ativo = true
    ) combined;
  EXCEPTION WHEN OTHERS THEN
    BEGIN
      SELECT COALESCE(array_agg(DISTINCT p.nome), ARRAY[]::text[]) INTO v_perms
      FROM public.usuario_permissoes up
      JOIN public.permissoes p ON up.permissao_id = p.id
      WHERE up.usuario_id = v_user_id AND p.ativo = true;
    EXCEPTION WHEN OTHERS THEN
      v_perms := ARRAY[]::text[];
    END;
  END;

  RETURN COALESCE(v_perms, ARRAY[]::text[]);
END;
$$;

-- Ensure has_permission() correctly bypasses for admin accounts
CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Admin bypass: is_admin() OR is_tenant_admin()
  IF public.is_admin() OR COALESCE(public.is_tenant_admin(), false) THEN
    RETURN true;
  END IF;

  -- Inactive users cannot have permissions
  IF NOT public.is_active_user() THEN
    RETURN false;
  END IF;

  -- Check direct user permissions
  IF EXISTS (
    SELECT 1 FROM public.usuario_permissoes up
    JOIN public.permissoes p ON up.permissao_id = p.id
    WHERE up.usuario_id = auth.uid() AND p.nome = permission_name AND p.ativo = true
  ) THEN
    RETURN true;
  END IF;

  -- Check cargo-based permissions (primary and secondary)
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.cargo_permissoes cp
      JOIN public.permissoes p ON cp.permissao_id = p.id
      JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
      WHERE u.id = auth.uid() AND p.nome = permission_name AND p.ativo = true
    ) THEN
      RETURN true;
    END IF;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN false;
END;
$$;

-- Ensure admin user has all permissions
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
  IF v_user_id IS NOT NULL THEN
    UPDATE public.usuarios SET role = 'admin', status = 'ativo' WHERE id = v_user_id;
    INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
    SELECT v_user_id, p.id FROM public.permissoes p WHERE p.ativo = true
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
