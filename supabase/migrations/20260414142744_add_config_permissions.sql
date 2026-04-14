DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'configuracoes_fornecedores') THEN
    INSERT INTO public.permissoes (nome, modulo, descricao)
    VALUES ('configuracoes_fornecedores', 'Configurações', 'Acessar Fornecedores');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'configuracoes_geral') THEN
    INSERT INTO public.permissoes (nome, modulo, descricao)
    VALUES ('configuracoes_geral', 'Configurações', 'Acessar Configurações Gerais');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'configuracoes_usuarios') THEN
    INSERT INTO public.permissoes (nome, modulo, descricao)
    VALUES ('configuracoes_usuarios', 'Configurações', 'Acessar Usuários e RH');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'configuracoes_permissoes') THEN
    INSERT INTO public.permissoes (nome, modulo, descricao)
    VALUES ('configuracoes_permissoes', 'Configurações', 'Acessar Cargos e Permissões');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.permissoes WHERE nome = 'configuracoes_parametros') THEN
    INSERT INTO public.permissoes (nome, modulo, descricao)
    VALUES ('configuracoes_parametros', 'Configurações', 'Acessar Parâmetros');
  END IF;
END $$;
