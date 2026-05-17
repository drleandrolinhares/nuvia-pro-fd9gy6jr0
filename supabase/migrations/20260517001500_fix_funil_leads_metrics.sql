-- DO BLOCK to safely add columns
DO $$
BEGIN
  ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS data_avaliacao date;
END $$;

-- Recreate trigger function trg_avaliacoes_to_funil
CREATE OR REPLACE FUNCTION public.trg_avaliacoes_to_funil()
RETURNS trigger AS $$
DECLARE
  v_lead_id uuid;
  v_paciente RECORD;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      
      SELECT nome, telefone INTO v_paciente FROM public.pacientes WHERE id = NEW.paciente_id;
      
      SELECT id INTO v_lead_id FROM public.funil_leads 
      WHERE (
        (telefone IS NOT NULL AND telefone != '' AND telefone = v_paciente.telefone) OR
        (lower(trim(nome)) = lower(trim(v_paciente.nome)))
      )
      ORDER BY criado_em DESC LIMIT 1;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = CASE 
              WHEN status IN ('venda_concretizada', 'fechamento', 'venda-fechada') THEN status 
              ELSE 'atendido' 
            END,
            origem_id = NEW.origem_id,
            data_avaliacao = COALESCE(NEW.data_avaliacao, data_avaliacao),
            atualizado_em = NOW()
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em
        ) VALUES (
          trim(v_paciente.nome), v_paciente.telefone, NEW.origem_id, to_char(COALESCE(NEW.data_avaliacao, CURRENT_DATE)::date, 'YYYY-MM'), 'atendido', COALESCE(NEW.temperatura_lead, 'morno'), 1, 0, NEW.data_avaliacao, COALESCE(NEW.data_avaliacao, CURRENT_DATE)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger function trg_vendas_confirmadas_to_funil
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
RETURNS trigger AS $$
DECLARE
  v_mes_referencia text;
  v_data_avaliacao date;
  v_lead_id uuid;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      IF NEW.oportunidade_id IS NOT NULL THEN
        SELECT to_char(data_avaliacao::date, 'YYYY-MM'), data_avaliacao 
        INTO v_mes_referencia, v_data_avaliacao
        FROM public.avaliacoes 
        WHERE id = NEW.oportunidade_id;
      END IF;

      IF v_mes_referencia IS NULL THEN
        IF NEW.data_original IS NOT NULL THEN
          v_mes_referencia := to_char(NEW.data_original::date, 'YYYY-MM');
          v_data_avaliacao := NEW.data_original;
        ELSE
          v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
          v_data_avaliacao := NEW.data_fechamento;
        END IF;
      END IF;
      
      SELECT id INTO v_lead_id FROM public.funil_leads 
      WHERE (
        (telefone IS NOT NULL AND telefone != '' AND telefone = NEW.telefone) OR
        (lower(trim(nome)) = lower(trim(NEW.paciente_nome)))
      )
      ORDER BY criado_em DESC LIMIT 1;

      IF v_lead_id IS NOT NULL THEN
        UPDATE public.funil_leads 
        SET status = 'venda_concretizada',
            temperatura = 'quente',
            origem_id = NEW.origem_id,
            data_avaliacao = COALESCE(data_avaliacao, v_data_avaliacao),
            atualizado_em = NOW()
        WHERE id = v_lead_id;
      ELSE
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas, data_avaliacao, criado_em
        ) VALUES (
          trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0, v_data_avaliacao, COALESCE(v_data_avaliacao, NEW.data_fechamento)
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate RPC atualizar_funil_dados_mensais
CREATE OR REPLACE FUNCTION public.atualizar_funil_dados_mensais(p_origem_id uuid, p_mes_referencia text)
RETURNS void AS $$
DECLARE
  v_total_leads INT;
  v_agendamentos INT;
  v_comparecimentos INT;
  v_fechamentos INT;
  v_faltas INT;
  v_valor_fechado NUMERIC;
BEGIN
  -- Leads (agora usa mes_referencia baseado em data_avaliacao/criado_em)
  SELECT COUNT(id) INTO v_total_leads FROM public.funil_leads 
  WHERE origem_id = p_origem_id 
  AND mes_referencia = p_mes_referencia
  AND lower(status) NOT IN ('lixo', 'teste', 'duplicado', 'erro', 'invalido', 'rascunho');
  
  -- Agendamentos
  SELECT COUNT(id) INTO v_agendamentos FROM public.funil_leads 
  WHERE origem_id = p_origem_id 
  AND mes_referencia = p_mes_referencia 
  AND (lower(status) IN ('agendado', 'reagendado', 'atendido', 'faltou', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento', 'negociacao', 'em_follow_up', 'venda-perdida') OR COALESCE(qtd_agendamentos, 0) > 0);

  -- Comparecimentos
  SELECT COUNT(id) INTO v_comparecimentos FROM public.funil_leads 
  WHERE origem_id = p_origem_id 
  AND mes_referencia = p_mes_referencia 
  AND lower(status) IN ('atendido', 'venda-fechada', 'venda_concretizada', 'avaliacao', 'fechamento', 'negociacao', 'em_follow_up', 'venda-perdida');

  -- Faltas
  SELECT COUNT(id) INTO v_faltas FROM public.funil_leads 
  WHERE origem_id = p_origem_id AND mes_referencia = p_mes_referencia
  AND (lower(status) = 'faltou' OR COALESCE(qtd_faltas, 0) > 0);

  -- Fechamentos (agora busca diretamente de vendas_confirmadas usando a data de fechamento)
  SELECT COUNT(id) INTO v_fechamentos FROM public.vendas_confirmadas 
  WHERE origem_id = p_origem_id 
  AND to_char(data_fechamento::date, 'YYYY-MM') = p_mes_referencia;

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
$$ LANGUAGE plpgsql;

-- Fix existing data and recalculate everything
DO $$
DECLARE
  v_origem RECORD;
  v_mes RECORD;
BEGIN
  -- Update data_avaliacao and mes_referencia based on vendas_confirmadas if it was missing
  UPDATE public.funil_leads fl
  SET data_avaliacao = COALESCE(v.data_original, v.data_fechamento),
      mes_referencia = to_char(COALESCE(v.data_original, v.data_fechamento)::date, 'YYYY-MM')
  FROM public.vendas_confirmadas v
  WHERE lower(trim(fl.nome)) = lower(trim(v.paciente_nome))
    AND fl.data_avaliacao IS NULL;

  -- Update data_avaliacao and mes_referencia based on avaliacoes
  UPDATE public.funil_leads fl
  SET data_avaliacao = a.data_avaliacao,
      mes_referencia = to_char(a.data_avaliacao::date, 'YYYY-MM')
  FROM public.avaliacoes a
  JOIN public.pacientes p ON p.id = a.paciente_id
  WHERE lower(trim(fl.nome)) = lower(trim(p.nome))
    AND fl.data_avaliacao IS NULL;

  -- Recalculate metrics for all origins and all months
  FOR v_origem IN SELECT id FROM public.funil_origens LOOP
    FOR v_mes IN 
      SELECT DISTINCT mes_referencia FROM public.funil_leads WHERE origem_id = v_origem.id AND mes_referencia IS NOT NULL
      UNION
      SELECT DISTINCT to_char(data_fechamento::date, 'YYYY-MM') FROM public.vendas_confirmadas WHERE origem_id = v_origem.id AND data_fechamento IS NOT NULL
    LOOP
      PERFORM public.atualizar_funil_dados_mensais(v_origem.id, v_mes.mes_referencia);
    END LOOP;
  END LOOP;
END $$;
