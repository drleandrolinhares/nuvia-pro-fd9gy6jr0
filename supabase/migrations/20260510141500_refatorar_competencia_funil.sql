-- Refatoração para garantir que a data da oportunidade seja mantida 
-- independente da data de fechamento da venda, prevenindo sobreposição de períodos no funil.

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
      -- Busca a data de avaliação original caso venha de uma oportunidade
      IF NEW.oportunidade_id IS NOT NULL THEN
        SELECT to_char(data_avaliacao::date, 'YYYY-MM') INTO v_mes_referencia 
        FROM public.avaliacoes 
        WHERE id = NEW.oportunidade_id;
      END IF;

      -- Fallback caso seja venda avulsa sem oportunidade prévia
      IF v_mes_referencia IS NULL THEN
        v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
      END IF;
      
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
        -- Cria lead fantasma vinculando ao mes da avaliacao original (ou fechamento se nao houver avaliacao)
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
