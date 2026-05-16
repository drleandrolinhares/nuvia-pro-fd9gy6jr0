DO $$
BEGIN
    ALTER TABLE public.funil_leads ALTER COLUMN qtd_agendamentos SET DEFAULT 0;
    
    UPDATE public.funil_leads 
    SET qtd_agendamentos = 0 
    WHERE qtd_agendamentos = 1 
      AND lower(status) NOT IN ('agendado', 'reagendado', 'atendido', 'faltou', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento');
END $$;

CREATE OR REPLACE FUNCTION public.atualizar_funil_dados_mensais(p_origem_id uuid, p_mes_referencia text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_total_leads INT;
    v_agendamentos INT;
    v_comparecimentos INT;
    v_fechamentos INT;
    v_faltas INT;
    v_valor_fechado NUMERIC;
  BEGIN
    SELECT COUNT(id) INTO v_total_leads FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia
    AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho');
    
    SELECT COUNT(id) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND (lower(status) IN ('agendado', 'reagendado', 'atendido', 'faltou', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento') OR COALESCE(qtd_agendamentos, 0) > 0);

    SELECT COUNT(id) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND lower(status) IN ('atendido', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento');

    SELECT COUNT(id) INTO v_fechamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND lower(status) IN ('fechamento', 'venda-fechada', 'venda_concretizada');
    
    SELECT COUNT(id) INTO v_faltas FROM public.funil_leads 
    WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia
    AND (lower(status) = 'faltou' OR COALESCE(qtd_faltas, 0) > 0);

    SELECT COALESCE(SUM(valor_tratamento), 0) INTO v_valor_fechado FROM public.vendas_confirmadas
    WHERE origem_id = p_origem_id 
    AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes_referencia;

    INSERT INTO public.funil_dados_mensais (
      origem_id, 
      mes_referencia, 
      leads_realizado, 
      agendamentos_realizado, 
      comparecimentos_realizado,
      fechamentos_qtde_realizado,
      fechamentos_valor_realizado,
      faltas_realizado,
      investimento,
      meta_leads,
      meta_agendamentos_qtde,
      meta_agendamentos_perc,
      meta_comparecimentos_qtde,
      meta_comparecimentos_perc,
      meta_fechamento_valor,
      ticket_medio_esperado
    )
    VALUES (
      p_origem_id, 
      p_mes_referencia, 
      v_total_leads, 
      v_agendamentos, 
      v_comparecimentos,
      v_fechamentos,
      v_valor_fechado,
      v_faltas,
      0, 0, 0, 0, 0, 0, 0, 0
    )
    ON CONFLICT (origem_id, mes_referencia) 
    DO UPDATE SET
      leads_realizado = EXCLUDED.leads_realizado,
      agendamentos_realizado = EXCLUDED.agendamentos_realizado,
      comparecimentos_realizado = EXCLUDED.comparecimentos_realizado,
      fechamentos_qtde_realizado = EXCLUDED.fechamentos_qtde_realizado,
      fechamentos_valor_realizado = EXCLUDED.fechamentos_valor_realizado,
      faltas_realizado = EXCLUDED.faltas_realizado,
      atualizado_em = NOW();
  END;
$function$;

DO $$
DECLARE
  v_origem RECORD;
BEGIN
  FOR v_origem IN SELECT id FROM public.funil_origens LOOP
    PERFORM public.atualizar_funil_dados_mensais(v_origem.id, '2026-05');
  END LOOP;
END $$;
