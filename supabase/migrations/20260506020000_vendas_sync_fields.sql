-- Add new columns to vendas_confirmadas
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS forma_pagamento text;
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS destino_pagamento text;
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS destino_fiscal text;

-- Drop and recreate the trigger to sync from vendas_diarias to vendas_confirmadas safely
CREATE OR REPLACE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
            destino_fiscal
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
            NEW.destino_fiscal
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
            destino_fiscal = NEW.destino_fiscal
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.vendas_confirmadas WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$;

-- Create reverse trigger to sync from vendas_confirmadas back to vendas_diarias
CREATE OR REPLACE FUNCTION public.trg_sync_confirmadas_to_vendas_diarias()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
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
            destino_fiscal = NEW.destino_fiscal
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.vendas_diarias WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS sync_confirmadas_to_vendas_diarias_trigger ON public.vendas_confirmadas;
CREATE TRIGGER sync_confirmadas_to_vendas_diarias_trigger
 AFTER UPDATE OR DELETE ON public.vendas_confirmadas
 FOR EACH ROW
 EXECUTE FUNCTION public.trg_sync_confirmadas_to_vendas_diarias();
