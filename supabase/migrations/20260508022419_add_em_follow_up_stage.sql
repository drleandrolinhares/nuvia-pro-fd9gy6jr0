DO $$
DECLARE
  v_fechamento_ordem INT;
  v_demitido_ordem INT;
  v_new_ordem INT;
BEGIN
  -- Let's find current orders
  SELECT ordem INTO v_fechamento_ordem FROM public.funil_etapas WHERE slug = 'fechamento';
  SELECT ordem INTO v_demitido_ordem FROM public.funil_etapas WHERE slug = 'demitido';
  
  -- If we found both, try to place it between them
  IF v_fechamento_ordem IS NOT NULL AND v_demitido_ordem IS NOT NULL THEN
    v_new_ordem := v_fechamento_ordem + 1;
    -- Shift others if needed to make space
    IF v_new_ordem >= v_demitido_ordem THEN
      UPDATE public.funil_etapas SET ordem = ordem + 10 WHERE ordem > v_fechamento_ordem;
      v_demitido_ordem := v_demitido_ordem + 10;
    END IF;
  ELSE
    -- Default fallback order if not found exactly
    v_new_ordem := 85;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.funil_etapas WHERE slug = 'em_follow_up') THEN
    INSERT INTO public.funil_etapas (nome, slug, cor, ordem, ativo)
    VALUES ('Em Follow-up', 'em_follow_up', '#0ea5e9', v_new_ordem, true);
  END IF;
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
  v_fechamentos INT;
  v_faltas INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_origem_id := OLD.origem_id;
    v_mes_referencia := OLD.mes_referencia;
  ELSE
    v_origem_id := NEW.origem_id;
    v_mes_referencia := NEW.mes_referencia;
  END IF;

  SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia;
  
  SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

  SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

  SELECT COUNT(*) INTO v_fechamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('fechamento', 'venda-fechada');
  
  SELECT COALESCE(SUM(COALESCE(qtd_faltas, 0)), 0) INTO v_faltas FROM public.funil_leads 
  WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia;

  INSERT INTO public.funil_dados_mensais (
    origem_id, 
    mes_referencia, 
    leads_realizado, 
    agendamentos_realizado, 
    comparecimentos_realizado,
    fechamentos_qtde_realizado,
    faltas_realizado,
    investimento,
    meta_leads,
    meta_agendamentos_qtde,
    meta_agendamentos_perc,
    meta_comparecimentos_qtde,
    meta_comparecimentos_perc,
    meta_fechamento_valor,
    ticket_medio_esperado,
    fechamentos_valor_realizado
  )
  VALUES (
    v_origem_id, 
    v_mes_referencia, 
    v_total_leads, 
    v_agendamentos, 
    v_comparecimentos,
    v_fechamentos,
    v_faltas,
    0, 0, 0, 0, 0, 0, 0, 0, 0
  )
  ON CONFLICT (origem_id, mes_referencia) 
  DO UPDATE SET
    leads_realizado = EXCLUDED.leads_realizado,
    agendamentos_realizado = EXCLUDED.agendamentos_realizado,
    comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
    fechamentos_qtde_realizado = EXCLUDED.fechamentos_qtde_realizado,
    faltas_realizado = EXCLUDED.faltas_realizado,
    atualizado_em = NOW();

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;
