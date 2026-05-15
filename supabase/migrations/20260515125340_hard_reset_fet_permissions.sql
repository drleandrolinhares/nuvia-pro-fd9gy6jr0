DO $$
DECLARE
  v_tenant RECORD;
  v_new_perm_id uuid;
  v_cargo RECORD;
BEGIN
  -- 1. Remove constraint de unicidade global falha, caso exista
  ALTER TABLE public.permissoes DROP CONSTRAINT IF EXISTS permissoes_nome_key;
  
  -- Adiciona constraint de unicidade baseada em multi-tenant (nome + tenant_id)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'permissoes_nome_tenant_key'
  ) THEN
    BEGIN
      ALTER TABLE public.permissoes ADD CONSTRAINT permissoes_nome_tenant_key UNIQUE (nome, tenant_id);
    EXCEPTION WHEN OTHERS THEN
      -- Se falhar (ex: registros duplicados já existentes no banco), ignora a criacao da constraint e continua a rotina
    END;
  END IF;

  -- 2. Hard Reset da Permissão Operacional FET para todos os tenants
  FOR v_tenant IN SELECT id FROM public.tenants LOOP
    
    -- Limpa vínculos antigos antes de deletar a permissão (garantia extra de integridade)
    DELETE FROM public.cargo_permissoes 
    WHERE permissao_id IN (
      SELECT id FROM public.permissoes 
      WHERE (nome = 'Acessar FET' OR nome = 'operacional_fet') AND tenant_id = v_tenant.id
    );

    DELETE FROM public.usuario_permissoes 
    WHERE permissao_id IN (
      SELECT id FROM public.permissoes 
      WHERE (nome = 'Acessar FET' OR nome = 'operacional_fet') AND tenant_id = v_tenant.id
    );

    -- Remove o registro corrompido ou mal configurado
    DELETE FROM public.permissoes 
    WHERE (nome = 'Acessar FET' OR nome = 'operacional_fet') 
      AND tenant_id = v_tenant.id;

    v_new_perm_id := gen_random_uuid();

    -- Cria o registro correto de forma limpa, com módulo capitalizado para aparecer na interface corretamente
    INSERT INTO public.permissoes (id, nome, descricao, modulo, tenant_id) 
    VALUES (
      v_new_perm_id, 
      'operacional_fet', 
      'Acessar FET', 
      'Operacional', 
      v_tenant.id
    );

    -- 3. Vincula automaticamente aos cargos de gerência para evitar que o acesso fique quebrado novamente
    FOR v_cargo IN SELECT id FROM public.cargos WHERE tenant_id = v_tenant.id AND nome ILIKE ANY (ARRAY['%admin%', '%ceo%', '%sócio%', '%socio%', '%gestor%', '%diretor%']) LOOP
      INSERT INTO public.cargo_permissoes (cargo_id, permissao_id, tenant_id)
      VALUES (v_cargo.id, v_new_perm_id, v_tenant.id)
      ON CONFLICT (cargo_id, permissao_id) DO NOTHING;
    END LOOP;

  END LOOP;
END $$;
