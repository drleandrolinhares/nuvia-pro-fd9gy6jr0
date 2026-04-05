DO $$
BEGIN
  -- Seed para Dentista Avaliador
  IF NOT EXISTS (SELECT 1 FROM public.referencias_comissao_dentista) THEN
    INSERT INTO public.referencias_comissao_dentista (faixa_entrada_minima, faixa_entrada_maxima, percentual_comissao, status)
    VALUES
      (0, 20, 2, 'ativo'),
      (20.01, 30, 3, 'ativo'),
      (30.01, 100, 4, 'ativo');
  END IF;

  -- Seed para CRC Comercial
  IF NOT EXISTS (SELECT 1 FROM public.referencias_comissao_crc) THEN
    INSERT INTO public.referencias_comissao_crc (faixa_entrada_minima, faixa_entrada_maxima, percentual_comissao, status)
    VALUES
      (0, 20, 1, 'ativo'),
      (20.01, 30, 1.5, 'ativo'),
      (30.01, 100, 2, 'ativo');
  END IF;
END $$;
