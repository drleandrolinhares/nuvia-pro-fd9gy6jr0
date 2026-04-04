DO $$
DECLARE
  forn_straumann uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  forn_nobel uuid := '22222222-2222-2222-2222-222222222222'::uuid;
  forn_3m uuid := '33333333-3333-3333-3333-333333333333'::uuid;

  prod_1 uuid := '44444444-4444-4444-4444-444444444444'::uuid;
  prod_2 uuid := '55555555-5555-5555-5555-555555555555'::uuid;
  prod_3 uuid := '66666666-6666-6666-6666-666666666666'::uuid;

  comp_1 uuid := '77777777-7777-7777-7777-777777777777'::uuid;
  comp_2 uuid := '88888888-8888-8888-8888-888888888888'::uuid;
  comp_3 uuid := '99999999-9999-9999-9999-999999999999'::uuid;
BEGIN
  -- Fornecedores
  INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email) VALUES
    (forn_straumann, 'Straumann', '11.111.111/0001-11', '(11) 91111-1111', 'contato@straumann.com'),
    (forn_nobel, 'Nobel Biocare', '22.222.222/0001-22', '(11) 92222-2222', 'contato@nobel.com'),
    (forn_3m, '3M', '33.333.333/0001-33', '(11) 93333-3333', 'contato@3m.com')
  ON CONFLICT (id) DO NOTHING;

  -- Produtos
  INSERT INTO public.produtos (id, nome, marca, custo_unitario, quantidade_estoque, referencia_consumo) VALUES
    (prod_1, 'Implante Titânio', 'Straumann', 150.00, 100, 'qtd_comprada'::public.referencia_consumo_enum),
    (prod_2, 'Resina Composta', '3M', 80.00, 50, 'qtd_comprada'::public.referencia_consumo_enum),
    (prod_3, 'Broca Cirúrgica', 'Nobel Biocare', 45.00, 200, 'qtd_comprada'::public.referencia_consumo_enum)
  ON CONFLICT (id) DO NOTHING;

  -- Compras
  INSERT INTO public.compras (id, fornecedor_id, data, nfe, valor_total_compra, status) VALUES
    (comp_1, forn_straumann, '2023-10-01', 'NFE-001', 1500.00, 'Finalizada'),
    (comp_2, forn_3m, '2023-10-15', 'NFE-002', 400.00, 'Rascunho'),
    (comp_3, forn_nobel, '2023-10-20', 'NFE-003', 450.00, 'Cancelada')
  ON CONFLICT (id) DO NOTHING;

  -- Compra Itens
  INSERT INTO public.compra_itens (id, compra_id, produto_id, qtd_comprada, valor_unitario, valor_total, referencia_consumo) VALUES
    (gen_random_uuid(), comp_1, prod_1, 10, 150.00, 1500.00, 'qtd_comprada'),
    (gen_random_uuid(), comp_2, prod_2, 5, 80.00, 400.00, 'qtd_comprada'),
    (gen_random_uuid(), comp_3, prod_3, 10, 45.00, 450.00, 'qtd_comprada')
  ON CONFLICT (id) DO NOTHING;

END $$;
