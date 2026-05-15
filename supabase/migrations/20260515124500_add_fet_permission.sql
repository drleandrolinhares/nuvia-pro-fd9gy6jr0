DO $$
DECLARE
  v_tenant RECORD;
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.tenants;
  
  IF v_count > 0 THEN
    FOR v_tenant IN SELECT id FROM public.tenants LOOP
      IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE tenant_id = v_tenant.id AND nome = 'Acessar FET') THEN
        INSERT INTO public.permissoes (id, nome, modulo, tenant_id, descricao)
        VALUES (gen_random_uuid(), 'Acessar FET', 'Operacional', v_tenant.id, 'Permite acessar e gerenciar o módulo FET (Ficha de Execução de Tratamento)');
      END IF;
    END LOOP;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE tenant_id IS NULL AND nome = 'Acessar FET') THEN
      INSERT INTO public.permissoes (id, nome, modulo, tenant_id, descricao)
      VALUES (gen_random_uuid(), 'Acessar FET', 'Operacional', NULL, 'Permite acessar e gerenciar o módulo FET (Ficha de Execução de Tratamento)');
    END IF;
  END IF;
END $$;
