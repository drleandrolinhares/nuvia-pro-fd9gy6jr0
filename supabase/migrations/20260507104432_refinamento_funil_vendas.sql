DO $$
BEGIN
  -- Remover bloco NÃO RESPONDE (desativar)
  UPDATE public.funil_etapas SET ativo = false WHERE slug IN ('nao-responde', 'nao_responde');
  
  -- Adicionar bloco FECHAMENTO
  IF NOT EXISTS (SELECT 1 FROM public.funil_etapas WHERE slug = 'fechamento') THEN
    INSERT INTO public.funil_etapas (nome, slug, cor, ordem, ativo)
    VALUES ('Fechamento', 'fechamento', '#10b981', 55, true);
  ELSE
    UPDATE public.funil_etapas SET ativo = true, nome = 'Fechamento' WHERE slug = 'fechamento';
  END IF;

  -- Ajustar ordem: ATENDIDO (40), FECHAMENTO (50), DEMITIDO (60)
  UPDATE public.funil_etapas SET ordem = 40 WHERE slug = 'atendido';
  UPDATE public.funil_etapas SET ordem = 50 WHERE slug = 'fechamento';
  UPDATE public.funil_etapas SET ordem = 60 WHERE slug = 'demitido';
END $$;

-- Ajustar a trigger do funil para contar as etapas corretamente, e reagendamentos
CREATE OR REPLACE FUNCTION public.trg_update_funil_dados_mensais_from_leads()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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

  -- Total de Leads
  SELECT COUNT(*) INTO v_total_leads FROM public.funil_leads WHERE origem_id = v_origem_id AND mes_referencia = v_mes_referencia;
  
  -- Agendamentos
  SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento');

  -- Comparecimentos
  SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento');

  -- Fechamentos
  SELECT COUNT(*) INTO v_fechamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('fechamento', 'venda-fechada');
  
  -- Faltas
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
$function$;

-- Trigger para automatizar a criação/movimentação de lead ao registrar venda direta
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
  v_lead_id uuid;
  v_mes_referencia text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Apenas se tiver origem informada
    IF NEW.origem_id IS NOT NULL THEN
      v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
      
      -- Tenta achar um lead existente com o mesmo nome
      SELECT id INTO v_lead_id FROM public.funil_leads 
      WHERE nome ILIKE NEW.paciente_nome 
      ORDER BY criado_em DESC LIMIT 1;
      
      IF v_lead_id IS NOT NULL THEN
        -- Atualiza o lead para status fechamento se ele nao estiver em fechamento
        UPDATE public.funil_leads 
        SET status = 'fechamento'
        WHERE id = v_lead_id AND status NOT IN ('fechamento', 'venda-fechada');
      ELSE
        -- Cria lead fantasma
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
        ) VALUES (
          NEW.paciente_nome, NEW.telefone, NEW.origem_id, v_mes_referencia, 'fechamento', 'quente', 1, 0
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_vendas_confirmadas_to_funil_tg ON public.vendas_confirmadas;
CREATE TRIGGER trg_vendas_confirmadas_to_funil_tg
AFTER INSERT OR UPDATE ON public.vendas_confirmadas
FOR EACH ROW EXECUTE FUNCTION public.trg_vendas_confirmadas_to_funil();

-- Sincronizar retroativamente as vendas diretas (Lançar Vendas) que não possuem lead
DO $$
DECLARE
  v_venda RECORD;
  v_lead_id uuid;
  v_mes_referencia text;
BEGIN
  FOR v_venda IN SELECT * FROM public.vendas_confirmadas WHERE origem_id IS NOT NULL LOOP
    v_mes_referencia := to_char(v_venda.data_fechamento::date, 'YYYY-MM');
    
    SELECT id INTO v_lead_id FROM public.funil_leads 
    WHERE nome ILIKE v_venda.paciente_nome 
    ORDER BY criado_em DESC LIMIT 1;
    
    IF v_lead_id IS NOT NULL THEN
      UPDATE public.funil_leads 
      SET status = 'fechamento'
      WHERE id = v_lead_id AND status NOT IN ('fechamento', 'venda-fechada');
    ELSE
      INSERT INTO public.funil_leads (
        nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
      ) VALUES (
        v_venda.paciente_nome, v_venda.telefone, v_venda.origem_id, v_mes_referencia, 'fechamento', 'quente', 1, 0
      );
    END IF;
  END LOOP;
END $$;
