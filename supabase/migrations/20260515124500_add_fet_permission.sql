DO $$
BEGIN
  INSERT INTO public.permissoes (id, nome, modulo, tenant_id, descricao)
  VALUES (gen_random_uuid(), 'Acessar FET', 'Operacional', NULL, 'Permite acessar e gerenciar o módulo FET (Ficha de Execução de Tratamento)')
  ON CONFLICT (nome) DO NOTHING;
END $$;
