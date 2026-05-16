-- Remover restrição de nome único
DROP INDEX IF EXISTS public.funil_leads_nome_mes_origem_idx;

-- Ajustar trigger de vendas confirmadas para funil (sem upsert)
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
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
      
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
        ) VALUES (
          trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0
        );
      END IF;

    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Ajustar a function de atualização para usar COUNT ao invés de SUM
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
    -- Contagem exclusiva de Leads usando COUNT(id) (Sem DISTINCT)
    SELECT COUNT(id) INTO v_total_leads FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia
    AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho');
    
    -- Agendamentos: COUNT in vez de SUM
    SELECT COUNT(id) INTO v_agendamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND (lower(status) IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up') OR COALESCE(qtd_agendamentos, 0) > 0);

    -- Comparecimentos (Sem DISTINCT)
    SELECT COUNT(id) INTO v_comparecimentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND lower(status) IN ('atendido', 'negociacao', 'venda-fechada', 'venda_concretizada', 'venda-perdida', 'avaliacao', 'fechamento', 'em_follow_up');

    -- Fechamentos (Sem DISTINCT)
    SELECT COUNT(id) INTO v_fechamentos FROM public.funil_leads 
    WHERE origem_id = p_origem_id 
    AND mes_referencia = p_mes_referencia 
    AND lower(status) IN ('fechamento', 'venda-fechada', 'venda_concretizada');
    
    -- Faltas: COUNT in vez de SUM
    SELECT COUNT(id) INTO v_faltas FROM public.funil_leads 
    WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia
    AND (lower(status) = 'faltou' OR COALESCE(qtd_faltas, 0) > 0);

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
