DO $$
DECLARE
  v_forn1_id uuid := gen_random_uuid();
  v_forn2_id uuid := gen_random_uuid();
  v_forn3_id uuid := gen_random_uuid();
  v_prod1_id uuid := gen_random_uuid();
  v_prod2_id uuid := gen_random_uuid();
  v_prod3_id uuid := gen_random_uuid();
  v_compra1_id uuid := gen_random_uuid();
  v_compra2_id uuid := gen_random_uuid();
  v_compra3_id uuid := gen_random_uuid();
BEGIN
  -- Insert Fornecedores mockados
  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = 'Straumann') THEN
    INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email) VALUES
    (v_forn1_id, 'Straumann', '00.000.000/0001-00', '(11) 99999-9999', 'contato@straumann.com');
  ELSE
    SELECT id INTO v_forn1_id FROM public.fornecedores WHERE nome = 'Straumann' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = 'Nobel Biocare') THEN
    INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email) VALUES
    (v_forn2_id, 'Nobel Biocare', '11.111.111/0001-11', '(11) 88888-8888', 'contato@nobel.com');
  ELSE
    SELECT id INTO v_forn2_id FROM public.fornecedores WHERE nome = 'Nobel Biocare' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.fornecedores WHERE nome = '3M Oral Care') THEN
    INSERT INTO public.fornecedores (id, nome, cnpj, telefone, email) VALUES
    (v_forn3_id, '3M Oral Care', '22.222.222/0001-22', '(11) 77777-7777', 'contato@3m.com');
  ELSE
    SELECT id INTO v_forn3_id FROM public.fornecedores WHERE nome = '3M Oral Care' LIMIT 1;
  END IF;

  -- Insert Produtos mockados
  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Implante Titânio' AND marca = 'Straumann') THEN
    INSERT INTO public.produtos (id, nome, marca, custo_unitario, quantidade_estoque, quantidade_minima, referencia_consumo) VALUES
    (v_prod1_id, 'Implante Titânio', 'Straumann', 450.00, 50, 10, 'qtd_comprada');
  ELSE
    SELECT id INTO v_prod1_id FROM public.produtos WHERE nome = 'Implante Titânio' AND marca = 'Straumann' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Resina Z350' AND marca = '3M') THEN
    INSERT INTO public.produtos (id, nome, marca, custo_unitario, quantidade_estoque, quantidade_minima, referencia_consumo) VALUES
    (v_prod2_id, 'Resina Z350', '3M', 120.00, 30, 5, 'qtd_comprada');
  ELSE
    SELECT id INTO v_prod2_id FROM public.produtos WHERE nome = 'Resina Z350' AND marca = '3M' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.produtos WHERE nome = 'Broca Diamantada' AND marca = 'Nobel') THEN
    INSERT INTO public.produtos (id, nome, marca, custo_unitario, quantidade_estoque, quantidade_minima, referencia_consumo) VALUES
    (v_prod3_id, 'Broca Diamantada', 'Nobel', 45.00, 100, 20, 'qtd_comprada');
  ELSE
    SELECT id INTO v_prod3_id FROM public.produtos WHERE nome = 'Broca Diamantada' AND marca = 'Nobel' LIMIT 1;
  END IF;

  -- Insert Compras mockadas
  IF NOT EXISTS (SELECT 1 FROM public.compras WHERE nfe = 'NFE-001001') THEN
    INSERT INTO public.compras (id, fornecedor_id, data, nfe, valor_total_compra, status) VALUES
    (v_compra1_id, v_forn1_id, CURRENT_DATE - INTERVAL '5 days', 'NFE-001001', 4500.00, 'Finalizada');
    
    INSERT INTO public.compra_itens (compra_id, produto_id, valor_total, qtd_comprada, valor_unitario, referencia_consumo) VALUES
    (v_compra1_id, v_prod1_id, 4500.00, 10, 450.00, 'qtd_comprada');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.compras WHERE nfe = 'NFE-002002') THEN
    INSERT INTO public.compras (id, fornecedor_id, data, nfe, valor_total_compra, status) VALUES
    (v_compra2_id, v_forn3_id, CURRENT_DATE - INTERVAL '2 days', 'NFE-002002', 1200.00, 'Rascunho');
    
    INSERT INTO public.compra_itens (compra_id, produto_id, valor_total, qtd_comprada, valor_unitario, referencia_consumo) VALUES
    (v_compra2_id, v_prod2_id, 1200.00, 10, 120.00, 'qtd_comprada');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.compras WHERE nfe = 'NFE-003003') THEN
    INSERT INTO public.compras (id, fornecedor_id, data, nfe, valor_total_compra, status) VALUES
    (v_compra3_id, v_forn2_id, CURRENT_DATE, 'NFE-003003', 900.00, 'Finalizada');
    
    INSERT INTO public.compra_itens (compra_id, produto_id, valor_total, qtd_comprada, valor_unitario, referencia_consumo) VALUES
    (v_compra3_id, v_prod3_id, 900.00, 20, 45.00, 'qtd_comprada');
  END IF;

END $$;
