DO $$
DECLARE
  v_perm_gerenciar uuid := gen_random_uuid();
  v_perm_editar uuid := gen_random_uuid();
  v_perm_visualizar uuid := gen_random_uuid();
  v_cargo_gerente uuid := gen_random_uuid();
  v_cargo_admin uuid := gen_random_uuid();
BEGIN
  -- Insert permissions if they don't exist
  INSERT INTO public.permissoes (id, nome, descricao, modulo)
  VALUES 
    (v_perm_gerenciar, 'Gerenciar Estoque', 'Permite registrar entradas e saídas de estoque', 'Estoque'),
    (v_perm_editar, 'Editar Estoque', 'Permite editar dados cadastrais dos produtos', 'Estoque'),
    (v_perm_visualizar, 'Visualizar Estoque', 'Permite visualizar o estoque', 'Estoque')
  ON CONFLICT (nome) DO UPDATE SET descricao = EXCLUDED.descricao, modulo = EXCLUDED.modulo;

  -- Get the actual IDs
  SELECT id INTO v_perm_gerenciar FROM public.permissoes WHERE nome = 'Gerenciar Estoque';
  SELECT id INTO v_perm_editar FROM public.permissoes WHERE nome = 'Editar Estoque';
  SELECT id INTO v_perm_visualizar FROM public.permissoes WHERE nome = 'Visualizar Estoque';

  -- Ensure 'Gerente de Estoque' exists
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Gerente de Estoque') THEN
    INSERT INTO public.cargos (id, nome, descricao, setor)
    VALUES (v_cargo_gerente, 'Gerente de Estoque', 'Responsável pelo controle de materiais', 'Operacional');
  ELSE
    SELECT id INTO v_cargo_gerente FROM public.cargos WHERE nome = 'Gerente de Estoque';
  END IF;

  -- Assign to Gerente de Estoque
  INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
  VALUES 
    (v_cargo_gerente, v_perm_gerenciar),
    (v_cargo_gerente, v_perm_editar),
    (v_cargo_gerente, v_perm_visualizar)
  ON CONFLICT ON CONSTRAINT cargo_permissoes_pkey DO NOTHING;

  -- Ensure 'Administrador' exists and assign permissions just in case
  IF NOT EXISTS (SELECT 1 FROM public.cargos WHERE nome = 'Administrador') THEN
    INSERT INTO public.cargos (id, nome, descricao, setor)
    VALUES (v_cargo_admin, 'Administrador', 'Acesso total ao sistema', 'Administrativo');
  ELSE
    SELECT id INTO v_cargo_admin FROM public.cargos WHERE nome = 'Administrador';
  END IF;

  INSERT INTO public.cargo_permissoes (cargo_id, permissao_id)
  VALUES 
    (v_cargo_admin, v_perm_gerenciar),
    (v_cargo_admin, v_perm_editar),
    (v_cargo_admin, v_perm_visualizar)
  ON CONFLICT ON CONSTRAINT cargo_permissoes_pkey DO NOTHING;

END $$;

-- Update RLS for produtos
DROP POLICY IF EXISTS "produtos_insert" ON public.produtos;
CREATE POLICY "produtos_insert" ON public.produtos
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text));

DROP POLICY IF EXISTS "produtos_update" ON public.produtos;
CREATE POLICY "produtos_update" ON public.produtos
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text))
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text) OR has_permission('Editar Estoque'::text));

DROP POLICY IF EXISTS "produtos_delete" ON public.produtos;
CREATE POLICY "produtos_delete" ON public.produtos
  FOR DELETE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

-- Update RLS for entrada_produtos
DROP POLICY IF EXISTS "entrada_produtos_insert" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_insert" ON public.entrada_produtos
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "entrada_produtos_update" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_update" ON public.entrada_produtos
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text))
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "entrada_produtos_delete" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_delete" ON public.entrada_produtos
  FOR DELETE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text));

-- Update RLS for saida_produtos
DROP POLICY IF EXISTS "saida_produtos_insert" ON public.saida_produtos;
CREATE POLICY "saida_produtos_insert" ON public.saida_produtos
  FOR INSERT TO authenticated
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "saida_produtos_update" ON public.saida_produtos;
CREATE POLICY "saida_produtos_update" ON public.saida_produtos
  FOR UPDATE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text))
  WITH CHECK (is_admin() OR has_permission('Gerenciar Estoque'::text));

DROP POLICY IF EXISTS "saida_produtos_delete" ON public.saida_produtos;
CREATE POLICY "saida_produtos_delete" ON public.saida_produtos
  FOR DELETE TO authenticated
  USING (is_admin() OR has_permission('Gerenciar Estoque'::text));
