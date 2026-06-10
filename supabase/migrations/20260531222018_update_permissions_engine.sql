DO $$
DECLARE
  v_user_id uuid;
  v_perm_id uuid;
  v_samara_id uuid;
BEGIN
  -- Cleanup orphaned permissions
  DELETE FROM public.usuario_permissoes WHERE permissao_id NOT IN (SELECT id FROM public.permissoes);
  DELETE FROM public.cargo_permissoes WHERE permissao_id NOT IN (SELECT id FROM public.permissoes);
  DELETE FROM public.cargo_permissoes WHERE cargo_id NOT IN (SELECT id FROM public.cargos);

  -- Ensure Dr Leandro exists
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
      crypt('Skip@Pass123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Dr Leandro Linhares"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, status, exigir_rotina)
    VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Dr Leandro Linhares', 'admin', 'ativo', false)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Ensure Samara permissions
  SELECT id INTO v_samara_id FROM public.usuarios WHERE nome ILIKE '%Samara%' LIMIT 1;
  IF v_samara_id IS NOT NULL THEN
    -- Assign all permissions
    FOR v_perm_id IN SELECT id FROM public.permissoes LOOP
      INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
      VALUES (v_samara_id, v_perm_id)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;

END $$;
