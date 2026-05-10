-- 1. Drop the trigger and function that prevented updating data_avaliacao
DROP TRIGGER IF EXISTS trg_prevent_data_avaliacao_update ON public.avaliacoes;
DROP FUNCTION IF EXISTS public.prevent_data_avaliacao_update();

-- 2. Create function to sync from avaliacoes to vendas_confirmadas
CREATE OR REPLACE FUNCTION public.trg_sync_avaliacoes_to_vendas()
RETURNS trigger AS $BODY$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    UPDATE public.vendas_confirmadas SET
      data_original = NEW.data_avaliacao,
      data_fechamento = COALESCE(NEW.data_fechamento, data_fechamento),
      valor_tratamento = COALESCE(NEW.valor_orcamento, valor_tratamento),
      valor_entrada = COALESCE(NEW.valor_entrada, valor_entrada),
      percentual_entrada = CASE 
        WHEN COALESCE(NEW.valor_orcamento, valor_tratamento) > 0 
        THEN (COALESCE(NEW.valor_entrada, valor_entrada) / COALESCE(NEW.valor_orcamento, valor_tratamento)) * 100 
        ELSE 0 
      END,
      dentista_avaliador = NEW.dentista_avaliador_id,
      crc = NEW.crc_comercial_id,
      destino_fiscal = NEW.destino_fiscal,
      origem_id = NEW.origem_id
    WHERE oportunidade_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_avaliacoes_to_vendas_trigger ON public.avaliacoes;
CREATE TRIGGER sync_avaliacoes_to_vendas_trigger
AFTER UPDATE ON public.avaliacoes
FOR EACH ROW
EXECUTE FUNCTION public.trg_sync_avaliacoes_to_vendas();


-- 3. Create function to sync from vendas_confirmadas to avaliacoes
CREATE OR REPLACE FUNCTION public.trg_sync_vendas_to_avaliacoes()
RETURNS trigger AS $BODY$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.oportunidade_id IS NOT NULL THEN
      UPDATE public.avaliacoes SET
        data_avaliacao = NEW.data_original,
        data_fechamento = NEW.data_fechamento,
        valor_orcamento = NEW.valor_tratamento,
        valor_entrada = NEW.valor_entrada,
        dentista_avaliador_id = NEW.dentista_avaliador,
        crc_comercial_id = NEW.crc,
        destino_fiscal = NEW.destino_fiscal,
        origem_id = NEW.origem_id
      WHERE id = NEW.oportunidade_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$BODY$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_vendas_to_avaliacoes_trigger ON public.vendas_confirmadas;
CREATE TRIGGER sync_vendas_to_avaliacoes_trigger
AFTER UPDATE ON public.vendas_confirmadas
FOR EACH ROW
EXECUTE FUNCTION public.trg_sync_vendas_to_avaliacoes();
