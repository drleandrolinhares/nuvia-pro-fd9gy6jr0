DO $$
DECLARE
  v_tenant_id uuid;
  new_user_id uuid;
  admin_role_id uuid;
  p_name text;
  p_mod text;
  p_id uuid;
BEGIN
  -- Garantir um tenant padrão
  SELECT id INTO v_tenant_id FROM public.tenants ORDER BY criado_em ASC LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    v_tenant_id := gen_random_uuid();
    INSERT INTO public.tenants (id, nome, slug, status, plano) 
    VALUES (v_tenant_id, 'Nuvia Odontologia', 'nuvia-odontologia', 'ativo', 'premium');
  END IF;

  -- Create ou resgatar o Admin User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'drleandrolinhares@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'tenant_id', v_tenant_id, 'is_super_admin', true),
      '{"name": "Dr Leandro"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
  ELSE
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com';
  END IF;

  -- Check if Admin role exists
  SELECT id INTO admin_role_id FROM public.cargos WHERE LOWER(nome) IN ('admin', 'administrador') AND tenant_id = v_tenant_id LIMIT 1;
  IF admin_role_id IS NULL THEN
    admin_role_id := gen_random_uuid();
    INSERT INTO public.cargos (id, nome, tenant_id) VALUES (admin_role_id, 'Administrador', v_tenant_id);
  END IF;

  -- Link user to profiles (usuarios)
  INSERT INTO public.usuarios (id, email, nome, role, cargo_id, tenant_id, status)
  VALUES (new_user_id, 'drleandrolinhares@gmail.com', 'Dr Leandro', 'admin', admin_role_id, v_tenant_id, 'ativo')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', cargo_id = admin_role_id, status = 'ativo';

  -- Lista de permissoes
  CREATE TEMP TABLE IF NOT EXISTS tmp_perms (nome text, modulo text);
  TRUNCATE tmp_perms;
  INSERT INTO tmp_perms (nome, modulo) VALUES
  ('Acessar Dashboard', 'Geral'),
  ('Acessar Chat', 'Geral'),
  ('Acessar Performance', 'Intranet'),
  ('Acessar Onboarding', 'Intranet'),
  ('Acessar Treinamentos', 'Intranet'),
  ('Acessar Comunicados', 'Operacional'),
  ('Acessar SAC', 'Operacional'),
  ('Acessar Gestão de Terceiros', 'Operacional'),
  ('Acessar Pedidos', 'Operacional'),
  ('Acessar FET', 'Operacional'),
  ('Acessar Rotina Diária', 'Operacional'),
  ('Acessar Funil de Vendas', 'Comercial'),
  ('Acessar Gestão de Vendas', 'Comercial'),
  ('Acessar Controle de Comissões', 'Comercial'),
  ('Acessar Negociações', 'Comercial'),
  ('Acessar Pacientes', 'Comercial'),
  ('Acessar Gestão Fiscal', 'Financeiro'),
  ('Acessar Fluxo de Caixa', 'Financeiro'),
  ('Acessar Estoque', 'Financeiro'),
  ('Acessar Precificação', 'Administrativo'),
  ('Acessar Pro Agenda', 'Diretrizes'),
  ('Acessar Roteiros', 'Diretrizes'),
  ('Acessar Parâmetros Gerais', 'Configurações'),
  ('Acessar Usuários', 'Configurações'),
  ('Acessar Fornecedores', 'Configurações'),
  ('Acessar Configurações de Rotinas', 'Configurações'),
  ('Acessar Smart Lock', 'Configurações'),
  ('Acessar Cadastros Básicos', 'Configurações'),
  ('Acessar Registro de Usuários', 'Configurações'),
  ('Acessar Descontos', 'Configurações'),
  ('Acessar Faixas', 'Configurações'),
  ('Acessar Controle de Acesso', 'Configurações');

  FOR p_name, p_mod IN SELECT nome, modulo FROM tmp_perms LOOP
    SELECT id INTO p_id FROM public.permissoes WHERE nome = p_name AND tenant_id = v_tenant_id LIMIT 1;
    IF p_id IS NULL THEN
      p_id := gen_random_uuid();
      INSERT INTO public.permissoes (id, nome, modulo, tenant_id) VALUES (p_id, p_name, p_mod, v_tenant_id);
    END IF;

    -- Atribuir ao cargo Administrador
    INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
    VALUES (admin_role_id, p_id, v_tenant_id)
    ON CONFLICT DO NOTHING;
    
    -- Atribuir diretamente ao usuario drleandro
    INSERT INTO public.usuario_permissoes (usuario_id, permissao_id, tenant_id)
    VALUES (new_user_id, p_id, v_tenant_id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  DROP TABLE tmp_perms;
END $$;
