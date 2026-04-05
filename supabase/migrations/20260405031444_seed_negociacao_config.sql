DO $$
BEGIN
  -- Insert into configuracoes_negociacao
  IF NOT EXISTS (SELECT 1 FROM public.configuracoes_negociacao) THEN
    INSERT INTO public.configuracoes_negociacao (id, percentual_entrada_padrao)
    VALUES (gen_random_uuid(), 30);
  END IF;

  -- Insert into faixas_valores_parcelas
  IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas WHERE faixa_numero = 1) THEN
    INSERT INTO public.faixas_valores_parcelas (faixa_numero, valor_minimo, valor_maximo, max_parcelas)
    VALUES (1, 1000, 2999.99, 12);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas WHERE faixa_numero = 2) THEN
    INSERT INTO public.faixas_valores_parcelas (faixa_numero, valor_minimo, valor_maximo, max_parcelas)
    VALUES (2, 3000, 4999.99, 12);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas WHERE faixa_numero = 3) THEN
    INSERT INTO public.faixas_valores_parcelas (faixa_numero, valor_minimo, valor_maximo, max_parcelas)
    VALUES (3, 5000, 6999.99, 20);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas WHERE faixa_numero = 4) THEN
    INSERT INTO public.faixas_valores_parcelas (faixa_numero, valor_minimo, valor_maximo, max_parcelas)
    VALUES (4, 7000, 8999.99, 20);
  END IF;

  -- Insert into descontos_por_prazo
  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 1) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao)
    VALUES (1, 15, 'PAGAMENTO ÚNICO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 2) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao)
    VALUES (2, 5, 'PRIMEIRO GRUPO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 3) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao)
    VALUES (3, 3, 'SEGUNDO GRUPO');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 4) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao)
    VALUES (4, 0, 'PARCELAS RESTANTES');
  END IF;
END $$;
