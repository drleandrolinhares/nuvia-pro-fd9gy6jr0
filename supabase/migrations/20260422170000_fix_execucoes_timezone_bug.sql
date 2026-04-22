DO $$
BEGIN
  -- Corrige as datas de execução para utilizar o fuso horário de Brasília (BRT)
  -- baseado na data de criação original do registro.
  -- Isso resolve o problema de registros feitos após as 21:00 sendo contabilizados
  -- para o dia seguinte devido ao fuso UTC.
  UPDATE public.execucoes_rotina
  SET data_execucao = (data_criacao AT TIME ZONE 'America/Sao_Paulo')::date
  WHERE data_execucao <> (data_criacao AT TIME ZONE 'America/Sao_Paulo')::date;
END $$;
