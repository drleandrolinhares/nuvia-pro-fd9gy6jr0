-- 1. Create the RPC function
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id uuid)
RETURNS text[]
AS $$
DECLARE
  v_perms text[];
BEGIN
  SELECT array_agg(DISTINCT p.nome) INTO v_perms
  FROM public.permissoes p
  WHERE p.id IN (
    -- Direct user permissions
    SELECT up.permissao_id
    FROM public.usuario_permissoes up
    WHERE up.usuario_id = p_user_id
    
    UNION
    
    -- Cargo permissions
    SELECT cp.permissao_id
    FROM public.cargo_permissoes cp
    JOIN public.usuarios u ON (cp.cargo_id = u.cargo_id OR cp.cargo_id = u.cargo_secundario_id)
    WHERE u.id = p_user_id
  );
  
  RETURN COALESCE(v_perms, ARRAY[]::text[]);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure RLS policies on permissions tables allow authenticated users to read
DROP POLICY IF EXISTS "authenticated_select_usuario_permissoes" ON public.usuario_permissoes;
CREATE POLICY "authenticated_select_usuario_permissoes" ON public.usuario_permissoes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "authenticated_select_cargo_permissoes" ON public.cargo_permissoes;
CREATE POLICY "authenticated_select_cargo_permissoes" ON public.cargo_permissoes
  FOR SELECT TO authenticated USING (true);

-- 3. Seed user drleandrolinhares@gmail.com
DO $$
DECLARE
  v_user_id uuid;
BEGIN
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
      '{"provider": "email", "providers": ["email"], "is_super_admin": true}',
      '{"name": "Leandro Linhares"}',
      true, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.usuarios (id, email, nome, role, status)
    VALUES (v_user_id, 'drleandrolinhares@gmail.com', 'Leandro Linhares', 'admin', 'ativo')
    ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'drleandrolinhares@gmail.com' LIMIT 1;
    UPDATE auth.users 
    SET is_super_admin = true, raw_app_meta_data = '{"provider": "email", "providers": ["email"], "is_super_admin": true}'::jsonb 
    WHERE id = v_user_id;
  END IF;
  
  -- Grant all permissions manually to the user to guarantee administrative permissions
  INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
  SELECT v_user_id, p.id FROM public.permissoes p
  ON CONFLICT (usuario_id, permissao_id) DO NOTHING;

END $$;
