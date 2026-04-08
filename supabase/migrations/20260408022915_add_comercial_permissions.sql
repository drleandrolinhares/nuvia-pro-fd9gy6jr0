DO $$
BEGIN
  INSERT INTO public.permissoes (id, nome, descricao, modulo)
  VALUES 
    (gen_random_uuid(), 'Acessar Gestão de Vendas', 'Permite acessar a tela de gestão de vendas', 'Comercial'),
    (gen_random_uuid(), 'Acessar Controle de Comissões', 'Permite acessar a tela de controle de comissões', 'Comercial'),
    (gen_random_uuid(), 'Acessar Fechamento de Comissões', 'Permite acessar a tela de fechamento de comissões', 'Comercial'),
    (gen_random_uuid(), 'Acessar Pacientes', 'Permite acessar a tela de pacientes no módulo comercial', 'Comercial'),
    (gen_random_uuid(), 'Acessar Negociações', 'Permite acessar a tela de negociações', 'Comercial')
  ON CONFLICT (nome) DO NOTHING;
END $$;
