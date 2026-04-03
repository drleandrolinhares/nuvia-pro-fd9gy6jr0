DO $$
DECLARE
  v_permissao_id uuid;
  v_cargo_admin_id uuid;
BEGIN
  -- Cria a permissão caso não exista
  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'Gerenciar Colaboradores') THEN
    INSERT INTO public.permissoes (id, nome, modulo, descricao)
    VALUES (gen_random_uuid(), 'Gerenciar Colaboradores', 'Configurações', 'Permite gerenciar a lista de colaboradores');
  END IF;

  SELECT id INTO v_permissao_id FROM public.permissoes WHERE nome = 'Gerenciar Colaboradores' LIMIT 1;

  -- Cria o cargo Administrador caso não exista
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Administrador') THEN
    INSERT INTO public.cargos (id, nome, setor, descricao)
    VALUES (gen_random_uuid(), 'Administrador', 'Diretoria', 'Acesso total ao sistema');
  END IF;

  SELECT id INTO v_cargo_admin_id FROM public.cargos WHERE nome = 'Administrador' LIMIT 1;

  -- Atrela a permissão ao cargo Administrador
  IF v_cargo_admin_id IS NOT NULL AND v_permissao_id IS NOT NULL THEN
    INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
    VALUES (v_cargo_admin_id, v_permissao_id)
    ON CONFLICT (cargo_id, permissao_id) DO NOTHING;
  END IF;

  -- Atualiza os administradores conhecidos para terem o cargo
  UPDATE public.usuarios
  SET cargo_id = v_cargo_admin_id
  WHERE email IN ('drleandro@nuvia.com', 'drleandrolinhares@gmail.com')
    AND cargo_id IS NULL;

END $$;
