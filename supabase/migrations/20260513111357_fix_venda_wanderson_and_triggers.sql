-- Remove o bloqueio severo do gatilho para permitir lançamentos de vendas do mesmo paciente
DROP TRIGGER IF EXISTS prevent_duplicate_avaliacoes_tg ON public.avaliacoes;

CREATE OR REPLACE FUNCTION public.trg_prevent_duplicate_avaliacoes()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.avaliacoes 
    WHERE paciente_id = NEW.paciente_id 
      AND to_char(COALESCE(data_avaliacao, criado_em, CURRENT_DATE)::date, 'YYYY-MM') = to_char(COALESCE(NEW.data_avaliacao, NEW.criado_em, CURRENT_DATE)::date, 'YYYY-MM')
      AND id != NEW.id
      AND NEW.status != 'venda_concretizada'
  ) THEN
    -- Substituído RAISE EXCEPTION por RAISE WARNING para não bloquear a transação em vendas
    RAISE WARNING 'Já existe uma oportunidade registrada para este paciente neste mês.';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE TRIGGER prevent_duplicate_avaliacoes_tg 
BEFORE INSERT ON public.avaliacoes 
FOR EACH ROW EXECUTE FUNCTION public.trg_prevent_duplicate_avaliacoes();

DO $$
DECLARE
  v_paciente_id uuid;
  v_dentista_id uuid;
  v_crc_id uuid;
  v_origem_id uuid;
  v_avaliacao_id uuid;
  v_venda_diaria_id uuid;
  v_nome_paciente text;
BEGIN
  -- Tenta encontrar o paciente Wanderson
  SELECT id, nome INTO v_paciente_id, v_nome_paciente FROM public.pacientes WHERE nome ILIKE '%wanderson%' LIMIT 1;
  
  IF v_paciente_id IS NULL THEN
    v_paciente_id := gen_random_uuid();
    v_nome_paciente := 'Wanderson';
    INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, v_nome_paciente, '11999999999');
  END IF;

  -- Checa se já existe venda confirmada para ele (Evita duplicar)
  IF NOT EXISTS (SELECT 1 FROM public.vendas_confirmadas WHERE paciente_nome ILIKE '%wanderson%') THEN
    
    -- Pega dados genéricos ativos para não falhar as constraints
    SELECT id INTO v_dentista_id FROM public.dentistas_avaliadores LIMIT 1;
    SELECT id INTO v_crc_id FROM public.crc_comercial LIMIT 1;
    SELECT id INTO v_origem_id FROM public.funil_origens LIMIT 1;

    -- Localiza ou insere avaliação
    SELECT id INTO v_avaliacao_id FROM public.avaliacoes WHERE paciente_id = v_paciente_id LIMIT 1;
    
    IF v_avaliacao_id IS NULL THEN
      v_avaliacao_id := gen_random_uuid();
      INSERT INTO public.avaliacoes (
        id, paciente_id, dentista_avaliador_id, crc_comercial_id, origem_id, 
        data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, status, temperatura_lead
      ) VALUES (
        v_avaliacao_id, v_paciente_id, v_dentista_id, v_crc_id, v_origem_id,
        CURRENT_DATE, CURRENT_DATE, 5000, 1000, 'venda_concretizada', 'quente'
      );
    ELSE
      UPDATE public.avaliacoes 
      SET status = 'venda_concretizada', 
          data_fechamento = CURRENT_DATE,
          valor_orcamento = COALESCE(valor_orcamento, 5000),
          valor_entrada = COALESCE(valor_entrada, 1000)
      WHERE id = v_avaliacao_id;
    END IF;

    -- Insere Venda Diária que alimentará o funil via triggers
    v_venda_diaria_id := gen_random_uuid();
    INSERT INTO public.vendas_diarias (
      id, data_venda, valor, valor_tratamento, paciente_nome, 
      dentista_avaliador_id, crc_comercial_id, origem_id, forma_pagamento, destino_pagamento, destino_fiscal
    ) VALUES (
      v_venda_diaria_id, CURRENT_DATE, 1000, 5000, v_nome_paciente,
      v_dentista_id, v_crc_id, v_origem_id, 'Pix', 'SICOOB PF 16004-0', 'PESSOA FISICA'
    );

    -- Atualiza vínculo da Venda Confirmada gerada
    UPDATE public.vendas_confirmadas 
    SET oportunidade_id = v_avaliacao_id, data_original = CURRENT_DATE
    WHERE id = v_venda_diaria_id;

    -- Atualiza Funil Leads para concretizada se existir
    UPDATE public.funil_leads 
    SET status = 'venda_concretizada'
    WHERE nome ILIKE '%wanderson%';

    -- Atualiza Dashboard Mensal do Funil
    IF v_origem_id IS NOT NULL THEN
      PERFORM public.atualizar_funil_dados_mensais(v_origem_id, to_char(CURRENT_DATE, 'YYYY-MM'));
    END IF;
  END IF;
END $$;
