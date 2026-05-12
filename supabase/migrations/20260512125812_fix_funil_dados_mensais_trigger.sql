DO $$
BEGIN
  -- Cria a funcao auxiliar se ela nao existir ou a substitui
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
  BEGIN
    SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia;
    
    SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    SELECT COUNT(*) INTO v_fechamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND status IN ('fechamento', 'venda-fechada');
    
    SELECT COALESCE(SUM(COALESCE(qtd_faltas, 0)), 0) INTO v_faltas FROM public.funil_leads 
    WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia;

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
      p_origem_id, 
      p_mes_referencia, 
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
  END;
  $function$;

  -- Atualiza o trigger de dados mensais
  CREATE OR REPLACE FUNCTION public.trg_update_funil_dados_mensais_from_leads()
   RETURNS trigger
   LANGUAGE plpgsql
  AS $function$
  DECLARE
    v_origem_id UUID;
    v_mes_referencia TEXT;
  BEGIN
    -- Se for UPDATE e a origem ou o mês mudou, atualiza a origem/mês antigos primeiro
    IF TG_OP = 'UPDATE' AND (OLD.origem_id IS DISTINCT FROM NEW.origem_id OR OLD.mes_referencia IS DISTINCT FROM NEW.mes_referencia) THEN
      PERFORM public.atualizar_funil_dados_mensais(OLD.origem_id, OLD.mes_referencia);
    END IF;

    IF TG_OP = 'DELETE' THEN
      v_origem_id := OLD.origem_id;
      v_mes_referencia := OLD.mes_referencia;
    ELSE
      v_origem_id := NEW.origem_id;
      v_mes_referencia := NEW.mes_referencia;
    END IF;

    PERFORM public.atualizar_funil_dados_mensais(v_origem_id, v_mes_referencia);

    RETURN NULL;
  END;
  $function$;

  -- Atualiza trg_vendas_confirmadas_to_funil
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
          SET status = 'venda-fechada', 
              origem_id = NEW.origem_id
          WHERE id = v_lead_id;
        ELSE
          INSERT INTO public.funil_leads (
            nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
          ) VALUES (
            NEW.paciente_nome, NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda-fechada', 'quente', 1, 0
          );
        END IF;
      END IF;
    END IF;
    RETURN NEW;
  END;
  $function$;

  -- Atualiza trg_sync_vendas_to_avaliacoes
  CREATE OR REPLACE FUNCTION public.trg_sync_vendas_to_avaliacoes()
   RETURNS trigger
   LANGUAGE plpgsql
  AS $function$
  BEGIN
    IF pg_trigger_depth() > 1 THEN
      RETURN NEW;
    END IF;
  
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      IF NEW.oportunidade_id IS NOT NULL THEN
        UPDATE public.avaliacoes SET
          data_avaliacao = COALESCE(NEW.data_original, data_avaliacao),
          data_fechamento = NEW.data_fechamento,
          valor_orcamento = NEW.valor_tratamento,
          valor_entrada = NEW.valor_entrada,
          dentista_avaliador_id = NEW.dentista_avaliador,
          crc_comercial_id = NEW.crc,
          destino_fiscal = NEW.destino_fiscal,
          origem_id = NEW.origem_id,
          status = 'venda-fechada'
        WHERE id = NEW.oportunidade_id;
      END IF;
    END IF;
  
    RETURN NEW;
  END;
  $function$;
END $$;
