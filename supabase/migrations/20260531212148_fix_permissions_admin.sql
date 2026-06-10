DO $$
DECLARE
  v_tenant_id uuid;
  v_user_id uuid;
  v_cargo_id uuid;
BEGIN
  -- Get first tenant
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  IF v_tenant_id IS NULL THEN RETURN; END IF;

  -- Ensure Dr. Leandro is super admin and exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com' LIMIT 1;
  
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr Leandro"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Ensure user in public.usuarios
  INSERT INTO public.usuarios (id, email, nome, tenant_id, status)
  VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Dr Leandro', v_tenant_id, 'ativo')
  ON CONFLICT (id) DO UPDATE SET status = 'ativo';

  -- Find or Create "Administrador" Cargo
  SELECT id INTO v_cargo_id FROM public.cargos WHERE nome = 'Administrador' AND tenant_id = v_tenant_id LIMIT 1;
  IF v_cargo_id IS NULL THEN
    INSERT INTO public.cargos (nome, setor, tenant_id) VALUES ('Administrador', 'Diretoria', v_tenant_id) RETURNING id INTO v_cargo_id;
  END IF;

  -- Link user to Cargo
  UPDATE public.usuarios SET cargo_id = v_cargo_id WHERE id = v_user_id;

  -- Grant all permissions to Administrador
  INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
  SELECT v_cargo_id, p.id, v_tenant_id
  FROM public.permissoes p
  WHERE (p.tenant_id = v_tenant_id OR p.tenant_id IS NULL)
  ON CONFLICT DO NOTHING;

END $$;
