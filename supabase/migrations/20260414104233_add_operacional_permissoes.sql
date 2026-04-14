-- Adiciona permissões operacionais e de vendas
INSERT INTO public.permissoes (id, nome, modulo, descricao) VALUES
  (gen_random_uuid(), 'Acessar SAC', 'Operacional', 'Permite acessar o módulo de SAC'),
  (gen_random_uuid(), 'Acessar Rotina Diária', 'Operacional', 'Permite acessar o módulo de Rotina Diária'),
  (gen_random_uuid(), 'Acessar Performance', 'Operacional', 'Permite acessar o módulo de Performance'),
  (gen_random_uuid(), 'Acessar Comunicados', 'Operacional', 'Permite acessar o módulo de Comunicados'),
  (gen_random_uuid(), 'Gerenciar Vendas', 'Comercial', 'Permite criar e gerenciar oportunidades de vendas')
ON CONFLICT (nome) DO NOTHING;
