DO $DO$
DECLARE
  v_origem RECORD;
BEGIN
  -- Atualizar a função auxiliar para contabilizar corretamente os status venda_concretizada
  CREATE OR REPLACE FUNCTION public.atualizar_funil_dados_mensais(p_origem_id UUID, p_mes_referencia TEXT)
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
    -- Contagem exclusiva de Leads (apenas quem NÃO avançou para avaliação ou venda)
    SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia
    AND LOWER(status) NOT IN ('venda-fechada', 'venda_concretizada', 'fechamento', 'avaliacao');
    
    -- Agendamentos (mantém histórico do funil para métricas de conversão)
    SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND LOWER(status) IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    -- Comparecimentos (mantém histórico)
    SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND LOWER(status) IN ('atendido', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    -- Fechamentos
    SELECT COUNT(*) INTO v_fechamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND LOWER(status) IN ('fechamento', 'venda-fechada', 'venda_concretizada');
    
    -- Faltas
    SELECT COALESCE(SUM(COALESCE(qtd_faltas, 0)), 0) INTO v_faltas FROM public.funil_leads 
    WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia;

    -- Valor Fechado
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

  -- Atualizar trg_vendas_confirmadas_to_funil
  CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
   RETURNS trigger
   LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_lead_id uuid;
    v_mes_referencia text;
  BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      IF NEW.origem_id IS NOT NULL THEN
        IF NEW.oportunidade_id IS NOT NULL THEN
          SELECT to_char(data_avaliacao::date, 'YYYY-MM') INTO v_mes_referencia 
          FROM public.avaliacoes 
          WHERE id = NEW.oportunidade_id;
        END IF;
  
        IF v_mes_referencia IS NULL THEN
          v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
        END IF;
        
        SELECT id INTO v_lead_id FROM public.funil_leads 
        WHERE nome ILIKE NEW.paciente_nome 
        ORDER BY criado_em DESC LIMIT 1;
        
        IF v_lead_id IS NOT NULL THEN
          UPDATE public.funil_leads 
          SET status = 'venda_concretizada', 
              origem_id = NEW.origem_id
          WHERE id = v_lead_id;
        ELSE
          INSERT INTO public.funil_leads (
            nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
          ) VALUES (
            NEW.paciente_nome, NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0
          );
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $function$;
  
  -- Atualizar leads retroativamente
  UPDATE public.funil_leads SET status = 'venda_concretizada' WHERE LOWER(status) = 'venda-fechada' OR LOWER(status) = 'venda_concretizada';
  
  -- Sincronizar todos os resumos para garantir unificação
  FOR v_origem IN SELECT DISTINCT origem_id, mes_referencia FROM public.funil_leads LOOP
    PERFORM public.atualizar_funil_dados_mensais(v_origem.origem_id, v_origem.mes_referencia);
  END LOOP;
  
END $DO$;
