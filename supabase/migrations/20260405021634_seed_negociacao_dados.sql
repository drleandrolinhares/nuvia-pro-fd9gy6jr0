DO $$
BEGIN
  -- configuracoes_negociacao
  IF NOT EXISTS (SELECT 1 FROM public.configuracoes_negociacao) THEN
    INSERT INTO public.configuracoes_negociacao (percentual_entrada_padrao) VALUES (30);
  END IF;

  -- descontos_por_prazo
  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 1) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES (1, 15, 'PAGAMENTO ÚNICO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 2) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES (2, 5, 'PRIMEIRO GRUPO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 3) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES (3, 3, 'SEGUNDO GRUPO');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.descontos_por_prazo WHERE faixa_numero = 4) THEN
    INSERT INTO public.descontos_por_prazo (faixa_numero, percentual_desconto, descricao) VALUES (4, 0, 'PARCELAS RESTANTES');
  END IF;

  -- faixas_valores_parcelas
  IF NOT EXISTS (SELECT 1 FROM public.faixas_valores_parcelas) THEN
    INSERT INTO public.faixas_valores_parcelas (valor_minimo, valor_maximo, max_parcelas) VALUES 
      (1000, 2999.99, 12),
      (3000, 4999.99, 12),
      (5000, 6999.99, 12),
      (7000, 8999.99, 12);
  END IF;
END $$;
