DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.dentistas_avaliadores WHERE nome = 'CONVERSÃO DIRETA') THEN
    INSERT INTO public.dentistas_avaliadores (nome, status)
    VALUES ('CONVERSÃO DIRETA', 'ativo');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.crc_comercial WHERE nome = 'CONVERSÃO DIRETA') THEN
    INSERT INTO public.crc_comercial (nome, status)
    VALUES ('CONVERSÃO DIRETA', 'ativo');
  END IF;
END $$;
