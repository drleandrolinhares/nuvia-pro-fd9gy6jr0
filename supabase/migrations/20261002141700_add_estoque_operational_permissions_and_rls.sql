-- Migration: 20261002141700_add_estoque_operational_permissions_and_rls.sql
-- Adiciona 'Editar Estoque' e 'Lançar Estoque' ao catálogo public.permissoes
-- Concede as novas permissões retroativamente a quem já possui 'Gerenciar Estoque'
-- Atualiza as políticas de RLS para produtos, entrada_produtos e saida_produtos

DO $$
DECLARE
  v_perm_lancar UUID := gen_random_uuid();
  v_perm_editar UUID := gen_random_uuid();
  v_id_gerenciar UUID;
  v_id_editar UUID;
  v_id_lancar UUID;
BEGIN
  -- 1. Inserir ou atualizar permissão "Lançar Estoque"
  INSERT INTO public.permissoes (id, nome, slug, modulo, descricao, ordem, ativo)
  VALUES (
    v_perm_lancar,
    'Lançar Estoque',
    'Lançar Estoque',
    'Estoque',
    'Permite registrar entradas e saídas de estoque',
    4,
    true
  )
  ON CONFLICT (slug) DO UPDATE
    SET nome = EXCLUDED.nome,
        modulo = EXCLUDED.modulo,
        descricao = EXCLUDED.descricao,
        ativo = true;

  -- 2. Inserir ou atualizar permissão "Editar Estoque"
  INSERT INTO public.permissoes (id, nome, slug, modulo, descricao, ordem, ativo)
  VALUES (
    v_perm_editar,
    'Editar Estoque',
    'Editar Estoque',
    'Estoque',
    'Permite editar informações cadastrais e dados dos produtos do estoque',
    5,
    true
  )
  ON CONFLICT (slug) DO UPDATE
    SET nome = EXCLUDED.nome,
        modulo = EXCLUDED.modulo,
        descricao = EXCLUDED.descricao,
        ativo = true;

  -- Garantir que "Gerenciar Estoque" também está no catálogo caso não exista
  INSERT INTO public.permissoes (nome, slug, modulo, descricao, ordem, ativo)
  VALUES (
    'Gerenciar Estoque',
    'Gerenciar Estoque',
    'Estoque',
    'Permite controle total do estoque, incluindo exclusões, fornecedores e compras',
    6,
    true
  )
  ON CONFLICT (slug) DO UPDATE
    SET nome = EXCLUDED.nome,
        modulo = EXCLUDED.modulo,
        descricao = EXCLUDED.descricao,
        ativo = true;

  -- Recuperar IDs reais das permissões
  SELECT id INTO v_id_gerenciar FROM public.permissoes WHERE nome = 'Gerenciar Estoque' LIMIT 1;
  SELECT id INTO v_id_editar FROM public.permissoes WHERE nome = 'Editar Estoque' LIMIT 1;
  SELECT id INTO v_id_lancar FROM public.permissoes WHERE nome = 'Lançar Estoque' LIMIT 1;

  -- 3. Retrocompatibilidade: Todo cargo que já tem 'Gerenciar Estoque' recebe também as novas
  IF v_id_gerenciar IS NOT NULL THEN
    IF v_id_lancar IS NOT NULL THEN
      INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
      SELECT cp.cargo_id, v_id_lancar, cp.tenant_id
      FROM public.cargo_permissoes cp
      WHERE cp.permissao_id = v_id_gerenciar
      ON CONFLICT DO NOTHING;

      INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
      SELECT up.usuario_id, v_id_lancar
      FROM public.usuario_permissoes up
      WHERE up.permissao_id = v_id_gerenciar
      ON CONFLICT DO NOTHING;
    END IF;

    IF v_id_editar IS NOT NULL THEN
      INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
      SELECT cp.cargo_id, v_id_editar, cp.tenant_id
      FROM public.cargo_permissoes cp
      WHERE cp.permissao_id = v_id_gerenciar
      ON CONFLICT DO NOTHING;

      INSERT INTO public.usuario_permissoes (usuario_id, permissao_id)
      SELECT up.usuario_id, v_id_editar
      FROM public.usuario_permissoes up
      WHERE up.permissao_id = v_id_gerenciar
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

END $$;

-- 4. RLS para public.produtos
-- Leitura liberada para quem tem 'Acessar Estoque', 'Gerenciar Estoque', 'Editar Estoque', 'Lançar Estoque' ou admin
DROP POLICY IF EXISTS "produtos_select" ON public.produtos;
DROP POLICY IF EXISTS "produtos_read" ON public.produtos;
CREATE POLICY "produtos_select" ON public.produtos
  FOR SELECT TO authenticated
  USING (
    is_admin() 
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Acessar Estoque') 
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
    OR has_permission('Lançar Estoque')
  );

-- Inserção de produtos: admin, Gerenciar Estoque ou Editar Estoque
DROP POLICY IF EXISTS "produtos_insert" ON public.produtos;
CREATE POLICY "produtos_insert" ON public.produtos
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
  );

-- Atualização de produtos: admin, Gerenciar Estoque ou Editar Estoque (e Lançar Estoque para atualizar custo_unitario se necessário)
DROP POLICY IF EXISTS "produtos_update" ON public.produtos;
CREATE POLICY "produtos_update" ON public.produtos
  FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
    OR has_permission('Lançar Estoque')
  )
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
    OR has_permission('Lançar Estoque')
  );

-- Exclusão de produtos: exclusivo de admin ou Gerenciar Estoque
DROP POLICY IF EXISTS "produtos_delete" ON public.produtos;
CREATE POLICY "produtos_delete" ON public.produtos
  FOR DELETE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
  );

-- 5. RLS para public.entrada_produtos
DROP POLICY IF EXISTS "entrada_produtos_read" ON public.entrada_produtos;
DROP POLICY IF EXISTS "entrada_produtos_select" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_select" ON public.entrada_produtos
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Acessar Estoque')
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "entrada_produtos_insert" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_insert" ON public.entrada_produtos
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "entrada_produtos_update" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_update" ON public.entrada_produtos
  FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  )
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "entrada_produtos_delete" ON public.entrada_produtos;
CREATE POLICY "entrada_produtos_delete" ON public.entrada_produtos
  FOR DELETE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
  );

-- 6. RLS para public.saida_produtos
DROP POLICY IF EXISTS "saida_produtos_read" ON public.saida_produtos;
DROP POLICY IF EXISTS "saida_produtos_select" ON public.saida_produtos;
CREATE POLICY "saida_produtos_select" ON public.saida_produtos
  FOR SELECT TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Acessar Estoque')
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Editar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "saida_produtos_insert" ON public.saida_produtos;
CREATE POLICY "saida_produtos_insert" ON public.saida_produtos
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "saida_produtos_update" ON public.saida_produtos;
CREATE POLICY "saida_produtos_update" ON public.saida_produtos
  FOR UPDATE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  )
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  );

DROP POLICY IF EXISTS "saida_produtos_delete" ON public.saida_produtos;
CREATE POLICY "saida_produtos_delete" ON public.saida_produtos
  FOR DELETE TO authenticated
  USING (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
  );

-- 7. RLS para historico_compras (inserido durante registrarEntrada)
DROP POLICY IF EXISTS "historico_compras_insert" ON public.historico_compras;
CREATE POLICY "historico_compras_insert" ON public.historico_compras
  FOR INSERT TO authenticated
  WITH CHECK (
    is_admin()
    OR COALESCE(is_tenant_admin(), false)
    OR has_permission('Gerenciar Estoque')
    OR has_permission('Lançar Estoque')
  );
