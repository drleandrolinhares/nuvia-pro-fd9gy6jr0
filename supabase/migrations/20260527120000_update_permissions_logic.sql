DO $$
DECLARE
  v_tenant_id uuid;
  v_admin_role_id uuid;
  v_user_id uuid;
  v_perm RECORD;
BEGIN
  -- Insert/Get Admin role
  SELECT id INTO v_tenant_id FROM public.tenants ORDER BY criado_em ASC LIMIT 1;
  IF v_tenant_id IS NULL THEN
    v_tenant_id := gen_random_uuid();
    INSERT INTO public.tenants (id, nome, slug) VALUES (v_tenant_id, 'Nuvia Odontologia', 'nuvia-odontologia');
  END IF;

  SELECT id INTO v_admin_role_id FROM public.cargos WHERE lower(public.unaccent_string(nome)) IN ('administrador', 'admin') AND tenant_id = v_tenant_id LIMIT 1;
  IF v_admin_role_id IS NULL THEN
    v_admin_role_id := gen_random_uuid();
    INSERT INTO public.cargos (id, nome, descricao, tenant_id) VALUES (v_admin_role_id, 'Administrador', 'Acesso total ao sistema', v_tenant_id);
  END IF;

  -- Assign all permissions to Administrador role
  FOR v_perm IN SELECT id FROM public.permissoes WHERE tenant_id = v_tenant_id OR tenant_id IS NULL LOOP
    INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id) 
    VALUES (v_admin_role_id, v_perm.id, v_tenant_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  -- Seed User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandrolinhares@gmail.com') THEN
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
      '{"provider": "email", "providers": ["email"], "tenant_id": "' || v_tenant_id || '"}',
      '{"name": "Dr. Leandro Linhares"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, status, cargo_id, possui_carteira, exigir_rotina, tenant_id)
    VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Dr. Leandro Linhares', 'admin', 'ativo', v_admin_role_id, true, false, v_tenant_id)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', cargo_id = v_admin_role_id, status = 'ativo';
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
    UPDATE public.usuarios SET role = 'admin', cargo_id = v_admin_role_id, status = 'ativo' WHERE id = v_user_id;
  END IF;

END $$;

CREATE OR REPLACE FUNCTION public.is_tenant_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
    v_role      text;
    v_cargo_id  uuid;
    v_cargo_sec_id uuid;
    v_cargo_nome text;
    v_cargo_sec_nome text;
    v_tenant_id uuid;
    v_status text;
BEGIN
    v_tenant_id := public.get_my_tenant_id();
    IF v_tenant_id IS NULL THEN RETURN false; END IF;
    
    SELECT role, cargo_id, cargo_secundario_id, status INTO v_role, v_cargo_id, v_cargo_sec_id, v_status
    FROM public.usuarios
    WHERE id = auth.uid() AND tenant_id = v_tenant_id;
    
    IF v_status = 'inativo' THEN RETURN false; END IF;

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
    IF v_status = 'inativo' THEN RETURN false; END IF;
    IF LOWER(v_role) IN ('admin', 'adm', 'administrador', 'ceo', 'socio', 'gestor', 'diretor') THEN
      RETURN true;
    END IF;
    RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(permission_name text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
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
    FROM public.usuarios WHERE id = auth.uid() AND tenant_id = v_tenant_id;

    IF v_status = 'inativo' THEN RETURN false; END IF;

    IF public.is_tenant_admin() THEN RETURN true; END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.usuario_permissoes up
        JOIN public.permissoes p ON p.id = up.permissao_id
        WHERE up.usuario_id = auth.uid() AND up.tenant_id = v_tenant_id
          AND public.unaccent_string(LOWER(p.nome)) = public.unaccent_string(LOWER(permission_name)) AND (p.tenant_id = v_tenant_id OR p.tenant_id IS NULL)
    ) INTO v_has_perm;
    IF v_has_perm THEN RETURN true; END IF;

    IF v_cargo_id IS NOT NULL OR v_cargo_sec_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.cargo_permissoes cp
            JOIN public.permissoes p ON p.id = cp.permissao_id
            WHERE cp.cargo_id IN (v_cargo_id, v_cargo_sec_id) AND cp.tenant_id = v_tenant_id
              AND public.unaccent_string(LOWER(p.nome)) = public.unaccent_string(LOWER(permission_name)) AND (p.tenant_id = v_tenant_id OR p.tenant_id IS NULL)
        ) INTO v_has_perm;
    END IF;
    
    RETURN v_has_perm;
END;
$$;
