-- Update trigger to set status to 'venda_concretizada' instead of 'venda-fechada'
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
        status = 'venda_concretizada'
      WHERE id = NEW.oportunidade_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Update existing records in avaliacoes to match the frontend standard
UPDATE public.avaliacoes
SET status = 'venda_concretizada'
WHERE status IN ('venda-fechada', 'Fechada em Comercial', 'Fechada em Avaliação');

-- Trigger para garantir que vendas_confirmadas sem oportunidade tenham uma
CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_paciente_id uuid;
BEGIN
  IF NEW.oportunidade_id IS NULL THEN
    -- Try to find patient by name
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE nome ILIKE NEW.paciente_nome LIMIT 1;
    
    -- If not found, create one
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, NEW.paciente_nome, NEW.telefone);
    END IF;
    
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
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_garantir_avaliacao_para_venda_tg ON public.vendas_confirmadas;
CREATE TRIGGER trg_garantir_avaliacao_para_venda_tg
  BEFORE INSERT ON public.vendas_confirmadas
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_garantir_avaliacao_para_venda();

-- Retroactive fix for existing vendas without oportunidade
DO $DO$
DECLARE
  v_venda RECORD;
  v_paciente_id uuid;
  v_nova_oportunidade_id uuid;
BEGIN
  FOR v_venda IN SELECT * FROM public.vendas_confirmadas WHERE oportunidade_id IS NULL LOOP
    -- Try to find patient by name
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE nome ILIKE v_venda.paciente_nome LIMIT 1;
    
    -- If not found, create one
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, v_venda.paciente_nome, v_venda.telefone)
      ON CONFLICT (id) DO NOTHING;
    END IF;
    
    v_nova_oportunidade_id := gen_random_uuid();
    
    INSERT INTO public.avaliacoes (
      id, paciente_id, dentista_avaliador_id, crc_comercial_id, 
      data_avaliacao, data_fechamento, valor_orcamento, valor_entrada, 
      status, temperatura_lead, origem_id, destino_fiscal
    ) VALUES (
      v_nova_oportunidade_id, v_paciente_id, v_venda.dentista_avaliador, v_venda.crc,
      COALESCE(v_venda.data_original, v_venda.data_fechamento), v_venda.data_fechamento, v_venda.valor_tratamento, v_venda.valor_entrada,
      'venda_concretizada', 'quente', v_venda.origem_id, v_venda.destino_fiscal
    ) ON CONFLICT (id) DO NOTHING;
    
    UPDATE public.vendas_confirmadas SET oportunidade_id = v_nova_oportunidade_id WHERE id = v_venda.id;
  END LOOP;
END;
$DO$;
