DO $$
BEGIN
  -- Recreate trigger function to properly include downstream statuses in counts
END $$;

CREATE OR REPLACE FUNCTION public.trg_update_funil_dados_mensais_from_leads()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_origem_id UUID;
  v_mes_referencia TEXT;
  v_total_leads INT;
  v_agendamentos INT;
  v_comparecimentos INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_origem_id := OLD.origem_id;
    v_mes_referencia := OLD.mes_referencia;
  ELSE
    v_origem_id := NEW.origem_id;
    v_mes_referencia := NEW.mes_referencia;
  END IF;

  SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia;
  
  -- Consideramos como Agendado qualquer status que represente um agendamento ou etapa posterior
  SELECT COUNT(*) INTO v_agendamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

  -- Consideramos como Comparecimento qualquer status que represente atendimento ou etapa posterior
  SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

  INSERT INTO public.funil_dados_mensais (
    origem_id, 
    mes_referencia, 
    leads_realizado, 
    agendamentos_realizado, 
    comparecimentos_realizado,
    investimento,
    meta_leads,
    meta_agendamentos_qtde,
    meta_agendamentos_perc,
    meta_comparecimentos_qtde,
    meta_comparecimentos_perc,
    meta_fechamento_valor,
    ticket_medio_esperado,
    fechamentos_qtde_realizado,
    fechamentos_valor_realizado
  )
  VALUES (
    v_origem_id, 
    v_mes_referencia, 
    v_total_leads, 
    v_agendamentos, 
    v_comparecimentos,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0
  )
  ON CONFLICT (origem_id, mes_referencia) 
  DO UPDATE SET
    leads_realizado = EXCLUDED.leads_realizado,
    agendamentos_realizado = EXCLUDED.agendamentos_realizado,
    comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
    atualizado_em = NOW();

  IF TG_OP = 'UPDATE' AND (NEW.origem_id != OLD.origem_id OR NEW.mes_referencia != OLD.mes_referencia) THEN
    SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia;
    
    SELECT COUNT(*) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia 
    AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

    SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia 
    AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

    UPDATE public.funil_dados_mensais
    SET 
      leads_realizado = v_total_leads,
      agendamentos_realizado = v_agendamentos,
      comparecimentos_realizado = v_comparecimentos,
      atualizado_em = NOW()
    WHERE origem_id = OLD.origem_id AND mes_referencia = OLD.mes_referencia;
  END IF;

  RETURN NULL;
END;
$$;

DO $$
DECLARE
  r RECORD;
  v_total_leads INT;
  v_agendamentos INT;
  v_comparecimentos INT;
BEGIN
  FOR r IN SELECT * FROM public.funil_dados_mensais LOOP
    SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = r.origem_id AND mes_referencia = r.mes_referencia;
    
    SELECT COUNT(*) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = r.origem_id AND mes_referencia = r.mes_referencia 
    AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

    SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = r.origem_id AND mes_referencia = r.mes_referencia 
    AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao');

    UPDATE public.funil_dados_mensais
    SET leads_realizado = v_total_leads,
        agendamentos_realizado = v_agendamentos,
        comparecimentos_realizado = v_comparecimentos
    WHERE id = r.id;
  END LOOP;
END $$;
