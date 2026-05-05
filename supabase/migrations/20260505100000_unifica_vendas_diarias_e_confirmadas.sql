-- Adicionar colunas de relacionamento na tabela vendas_diarias
ALTER TABLE public.vendas_diarias 
ADD COLUMN IF NOT EXISTS dentista_avaliador_id UUID REFERENCES public.dentistas_avaliadores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS crc_comercial_id UUID REFERENCES public.crc_comercial(id) ON DELETE SET NULL;

-- Criar a função do trigger para sincronização unificada de vendas
CREATE OR REPLACE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas()
RETURNS TRIGGER AS $$
BEGIN
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
            tratamento
        ) VALUES (
            NEW.id,
            COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
            NEW.data_venda,
            COALESCE(NEW.valor_tratamento, NEW.valor),
            NEW.valor,
            100,
            NEW.dentista_avaliador_id,
            NEW.crc_comercial_id,
            'Venda Avulsa'
        );
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.vendas_confirmadas SET
            paciente_nome = COALESCE(NEW.paciente_nome, 'Venda Avulsa'),
            data_fechamento = NEW.data_venda,
            valor_tratamento = COALESCE(NEW.valor_tratamento, NEW.valor),
            valor_entrada = NEW.valor,
            dentista_avaliador = NEW.dentista_avaliador_id,
            crc = NEW.crc_comercial_id
        WHERE id = NEW.id;
    ELSIF TG_OP = 'DELETE' THEN
        DELETE FROM public.vendas_confirmadas WHERE id = OLD.id;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Dropar trigger se existir e recriar
DROP TRIGGER IF EXISTS sync_vendas_diarias ON public.vendas_diarias;
CREATE TRIGGER sync_vendas_diarias
AFTER INSERT OR UPDATE OR DELETE ON public.vendas_diarias
FOR EACH ROW EXECUTE FUNCTION public.trg_sync_vendas_diarias_to_confirmadas();

-- Backfill dos dados existentes (migrar vendas diárias antigas para a confirmadas para unificação no sistema)
DO $$
DECLARE
    v_row RECORD;
BEGIN
    FOR v_row IN SELECT * FROM public.vendas_diarias LOOP
        IF NOT EXISTS (SELECT 1 FROM public.vendas_confirmadas WHERE id = v_row.id) THEN
            INSERT INTO public.vendas_confirmadas (
                id,
                paciente_nome,
                data_fechamento,
                valor_tratamento,
                valor_entrada,
                percentual_entrada,
                dentista_avaliador,
                crc,
                tratamento
            ) VALUES (
                v_row.id,
                COALESCE(v_row.paciente_nome, 'Venda Avulsa'),
                v_row.data_venda,
                COALESCE(v_row.valor_tratamento, v_row.valor),
                v_row.valor,
                100,
                v_row.dentista_avaliador_id,
                v_row.crc_comercial_id,
                'Venda Avulsa'
            );
        END IF;
    END LOOP;
END $$;
