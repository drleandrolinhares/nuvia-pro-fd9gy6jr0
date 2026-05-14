CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_paciente_id uuid;
  v_oportunidade_id uuid;
BEGIN
  IF NEW.oportunidade_id IS NULL THEN
    -- Try to find patient by name
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE nome ILIKE NEW.paciente_nome LIMIT 1;
    
    -- If not found, create one
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, NEW.paciente_nome, NEW.telefone);
    ELSE
      -- Patient found, let's see if there's an evaluation to link to, to avoid duplicates
      SELECT id INTO v_oportunidade_id 
      FROM public.avaliacoes 
      WHERE paciente_id = v_paciente_id 
      ORDER BY criado_em DESC LIMIT 1;
    END IF;
    
    IF v_oportunidade_id IS NOT NULL THEN
      NEW.oportunidade_id := v_oportunidade_id;
    ELSE
      -- Create evaluation
      NEW.oportunidade_id := gen_random_uuid();
      INSERT INTO public.avaliacoes (
        id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
        data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
        status, temperatura_lead, origem_id, destino_fiscal
      ) VALUES (
        NEW.oportunidade_id, v_paciente_id, NEW.dentista_avaliador, NEW.crc,
        COALESCE(NEW.data_original, NEW.data_fechamento), NEW.data_fechamento, NEW.valor_tratamento, NEW.valor_entrada,
        'venda_concretizada', 'quente', NEW.origem_id, NEW.destino_fiscal
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
