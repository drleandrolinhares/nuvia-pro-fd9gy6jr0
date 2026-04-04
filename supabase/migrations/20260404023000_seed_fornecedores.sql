DO $$
BEGIN
  INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email, endereco, contato_principal)
  VALUES 
    ('f0000000-0000-0000-0000-000000000001'::uuid, 'Straumann', '12.345.678/0001-90', '(11) 98765-4321', 'contato@straumann.com', 'Av. Paulista, 1000 - São Paulo, SP', 'Carlos Silva'),
    ('f0000000-0000-0000-0000-000000000002'::uuid, 'Nobel Biocare', '98.765.432/0001-10', '(21) 91234-5678', 'vendas@nobelbiocare.com', 'Rua das Laranjeiras, 500 - Rio de Janeiro, RJ', 'Ana Souza'),
    ('f0000000-0000-0000-0000-000000000003'::uuid, '3M', '33.333.333/0001-33', '(19) 93333-3333', 'comercial@3m.com', 'Rodovia Anhanguera, km 110 - Sumaré, SP', 'Roberto Lima')
  ON CONFLICT (id) DO NOTHING;
END $$;
