DO $$
DECLARE
  v_tenant_id uuid;
  v_user_id uuid;
BEGIN
  -- 1. Create a default tenant if it doesn't exist
  v_tenant_id := '00000000-0000-0000-0000-000000000001'::uuid;
  
  INSERT INTO public.tenants (id, slug, nome, status, plano)
  VALUES (v_tenant_id, 'nuvia-odontologia', 'NUVIA PRO', 'ativo', 'pro')
  ON CONFLICT (id) DO UPDATE SET 
    slug = EXCLUDED.slug, 
    nome = EXCLUDED.nome, 
    status = EXCLUDED.status, 
    plano = EXCLUDED.plano;

  -- 2. Seed the admin user
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com' LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, 
      raw_app_meta_data, 
      raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'drleandrolinhares@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      jsonb_build_object('provider', 'email', 'providers', array['email'], 'tenant_id', v_tenant_id, 'is_tenant_admin', true, 'is_super_admin', true),
      '{"name": "Dr. Leandro Linhares"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );
    
    INSERT INTO public.usuarios (id, email, nome, role, status, tenant_id, possui_carteira)
    VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Dr. Leandro Linhares', 'admin', 'ativo', v_tenant_id, true)
    ON CONFLICT (id) DO NOTHING;
  ELSE
    UPDATE auth.users 
    SET raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email'], 'tenant_id', v_tenant_id, 'is_tenant_admin', true, 'is_super_admin', true)
    WHERE id = v_user_id;

    UPDATE public.usuarios
    SET tenant_id = v_tenant_id
    WHERE id = v_user_id;
  END IF;

  -- 3. Fix RLS Policies for requested tables
  
  -- usuarios
  DROP POLICY IF EXISTS "usuarios_read_own" ON public.usuarios;
  DROP POLICY IF EXISTS "usuarios_select" ON public.usuarios;
  DROP POLICY IF EXISTS "usuarios_update" ON public.usuarios;
  DROP POLICY IF EXISTS "usuarios_insert" ON public.usuarios;
  DROP POLICY IF EXISTS "usuarios_delete" ON public.usuarios;

  CREATE POLICY "usuarios_select" ON public.usuarios
    FOR SELECT TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "usuarios_insert" ON public.usuarios
    FOR INSERT TO authenticated WITH CHECK (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "usuarios_update" ON public.usuarios
    FOR UPDATE TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "usuarios_delete" ON public.usuarios
    FOR DELETE TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );

  -- colaboradores_detalhes
  DROP POLICY IF EXISTS "colaboradores_detalhes_select" ON public.colaboradores_detalhes;
  DROP POLICY IF EXISTS "colaboradores_detalhes_insert" ON public.colaboradores_detalhes;
  DROP POLICY IF EXISTS "colaboradores_detalhes_update" ON public.colaboradores_detalhes;
  DROP POLICY IF EXISTS "colaboradores_detalhes_delete" ON public.colaboradores_detalhes;
  
  CREATE POLICY "colaboradores_detalhes_select" ON public.colaboradores_detalhes
    FOR SELECT TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "colaboradores_detalhes_insert" ON public.colaboradores_detalhes
    FOR INSERT TO authenticated WITH CHECK (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "colaboradores_detalhes_update" ON public.colaboradores_detalhes
    FOR UPDATE TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );
  CREATE POLICY "colaboradores_detalhes_delete" ON public.colaboradores_detalhes
    FOR DELETE TO authenticated USING (
      tenant_id = get_my_tenant_id() OR tenant_id IS NULL OR is_super_admin()
    );

  -- vendas_confirmadas
  DROP POLICY IF EXISTS "vendas_confirmadas_select" ON public.vendas_confirmadas;
  DROP POLICY IF EXISTS "vendas_confirmadas_all" ON public.vendas_confirmadas;
  DROP POLICY IF EXISTS "vendas_confirmadas_insert" ON public.vendas_confirmadas;
  DROP POLICY IF EXISTS "vendas_confirmadas_update" ON public.vendas_confirmadas;
  DROP POLICY IF EXISTS "vendas_confirmadas_delete" ON public.vendas_confirmadas;

  CREATE POLICY "vendas_confirmadas_select" ON public.vendas_confirmadas
    FOR SELECT TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Gestão de Vendas') OR is_super_admin())
    );
  CREATE POLICY "vendas_confirmadas_insert" ON public.vendas_confirmadas
    FOR INSERT TO authenticated WITH CHECK (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Gestão de Vendas') OR is_super_admin())
    );
  CREATE POLICY "vendas_confirmadas_update" ON public.vendas_confirmadas
    FOR UPDATE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Gestão de Vendas') OR is_super_admin())
    );
  CREATE POLICY "vendas_confirmadas_delete" ON public.vendas_confirmadas
    FOR DELETE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Gestão de Vendas') OR is_super_admin())
    );

  -- avaliacoes
  DROP POLICY IF EXISTS "avaliacoes_select" ON public.avaliacoes;
  DROP POLICY IF EXISTS "avaliacoes_insert" ON public.avaliacoes;
  DROP POLICY IF EXISTS "avaliacoes_update" ON public.avaliacoes;
  DROP POLICY IF EXISTS "avaliacoes_delete" ON public.avaliacoes;

  CREATE POLICY "avaliacoes_select" ON public.avaliacoes
    FOR SELECT TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Funil de Vendas') OR is_super_admin())
    );
  CREATE POLICY "avaliacoes_insert" ON public.avaliacoes
    FOR INSERT TO authenticated WITH CHECK (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Funil de Vendas') OR is_super_admin())
    );
  CREATE POLICY "avaliacoes_update" ON public.avaliacoes
    FOR UPDATE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Funil de Vendas') OR is_super_admin())
    );
  CREATE POLICY "avaliacoes_delete" ON public.avaliacoes
    FOR DELETE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Funil de Vendas') OR is_super_admin())
    );

  -- produtos
  DROP POLICY IF EXISTS "produtos_select" ON public.produtos;
  DROP POLICY IF EXISTS "produtos_insert" ON public.produtos;
  DROP POLICY IF EXISTS "produtos_update" ON public.produtos;
  DROP POLICY IF EXISTS "produtos_delete" ON public.produtos;

  CREATE POLICY "produtos_select" ON public.produtos
    FOR SELECT TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Estoque') OR is_super_admin())
    );
  CREATE POLICY "produtos_insert" ON public.produtos
    FOR INSERT TO authenticated WITH CHECK (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Estoque') OR is_super_admin())
    );
  CREATE POLICY "produtos_update" ON public.produtos
    FOR UPDATE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Estoque') OR is_super_admin())
    );
  CREATE POLICY "produtos_delete" ON public.produtos
    FOR DELETE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar Estoque') OR is_super_admin())
    );

  -- sac_demandas
  DROP POLICY IF EXISTS "sac_demandas_select" ON public.sac_demandas;
  DROP POLICY IF EXISTS "sac_demandas_insert" ON public.sac_demandas;
  DROP POLICY IF EXISTS "sac_demandas_update" ON public.sac_demandas;
  DROP POLICY IF EXISTS "sac_demandas_delete" ON public.sac_demandas;

  CREATE POLICY "sac_demandas_select" ON public.sac_demandas
    FOR SELECT TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar SAC') OR is_super_admin())
    );
  CREATE POLICY "sac_demandas_insert" ON public.sac_demandas
    FOR INSERT TO authenticated WITH CHECK (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar SAC') OR is_super_admin())
    );
  CREATE POLICY "sac_demandas_update" ON public.sac_demandas
    FOR UPDATE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar SAC') OR is_super_admin())
    );
  CREATE POLICY "sac_demandas_delete" ON public.sac_demandas
    FOR DELETE TO authenticated USING (
      (tenant_id = get_my_tenant_id() OR tenant_id IS NULL) AND 
      (is_tenant_admin() OR has_permission('Acessar SAC') OR is_super_admin())
    );

END $$;
