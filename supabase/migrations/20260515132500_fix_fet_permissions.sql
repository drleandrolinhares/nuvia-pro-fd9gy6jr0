DO $$
DECLARE
  v_tenant_id uuid;
  v_fet_perm_id uuid;
BEGIN
  -- Percorre todos os tenants para garantir a correção em ambiente multi-tenant
  FOR v_tenant_id IN SELECT id FROM public.tenants LOOP
    
    -- HARD RESET: Remove qualquer variação antiga ou corrompida da permissão FET
    DELETE FROM public.permissoes 
    WHERE tenant_id = v_tenant_id 
      AND (nome ILIKE '%fet%' OR nome ILIKE '%Acessar FET%' OR nome ILIKE 'operacional_fet');
      
    -- Insere a nova permissão padronizada
    v_fet_perm_id := gen_random_uuid();
    
    INSERT INTO public.permissoes (id, nome, modulo, descricao, tenant_id)
    VALUES (
      v_fet_perm_id, 
      'Acessar FET', 
      'Operacional', 
      'Acesso à página e rotinas da Ficha de Evolução do Tratamento (FET)', 
      v_tenant_id
    ) ON CONFLICT (nome, tenant_id) DO NOTHING;
    
  END LOOP;
END $$;
