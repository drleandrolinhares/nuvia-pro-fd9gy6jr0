ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS origem_id uuid REFERENCES public.funil_origens(id) ON DELETE SET NULL;
ALTER TABLE public.vendas_diarias ADD COLUMN IF NOT EXISTS origem_id uuid REFERENCES public.funil_origens(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS sync_vendas_diarias ON public.vendas_diarias;
DROP TRIGGER IF EXISTS sync_confirmadas_to_vendas_diarias_trigger ON public.vendas_confirmadas;

CREATE OR REPLACE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas()
RETURNS trigger AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;
    
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.vendas_confirmadas (
            id,
            paciente_nome,
            data_fechamento,
            valor_tratamento,
            valor_entrada,
            percentual_entrada,
            dentista_avaliador,
            crc,
            tratamento,
            forma_pagamento,
            destino_pagamento,
            destino_fiscal,
            origem_id
        ) VALUES (
            NEW.id,
            COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
            NEW.data_venda,
            COALESCE(NEW.valor_tratamento, NEW.valor),
            NEW.valor,
            100,
            NEW.dentista_avaliador_id,
            NEW.crc_comercial_id,
            'Venda Avulsa',
            NEW.forma_pagamento,
            NEW.destino_pagamento,
            NEW.destino_fiscal,
            NEW.origem_id
        );
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.vendas_confirmadas SET
            paciente_nome = COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
            data_fechamento = NEW.data_venda,
            valor_tratamento = COALESCE(NEW.valor_tratamento, NEW.valor),
            valor_entrada = NEW.valor,
            dentista_avaliador = NEW.dentista_avaliador_id,
            crc = NEW.crc_comercial_id,
            forma_pagamento = NEW.forma_pagamento,
            destino_pagamento = NEW.destino_pagamento,
            destino_fiscal = NEW.destino_fiscal,
            origem_id = NEW.origem_id
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.vendas_confirmadas WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_vendas_diarias 
AFTER INSERT OR UPDATE OR DELETE ON public.vendas_diarias 
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas();

CREATE OR REPLACE FUNCTION public.trg_sync_confirmadas_to_vendas_diarias()
RETURNS trigger AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        UPDATE public.vendas_diarias SET
            paciente_nome = NEW.paciente_nome,
            data_venda = NEW.data_fechamento,
            valor_tratamento = NEW.valor_tratamento,
            valor = NEW.valor_entrada,
            dentista_avaliador_id = NEW.dentista_avaliador,
            crc_comercial_id = NEW.crc,
            forma_pagamento = NEW.forma_pagamento,
            destino_pagamento = NEW.destino_pagamento,
            destino_fiscal = NEW.destino_fiscal,
            origem_id = NEW.origem_id
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.vendas_diarias WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_confirmadas_to_vendas_diarias_trigger 
AFTER UPDATE OR DELETE ON public.vendas_confirmadas 
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_confirmadas_to_vendas_diarias();
