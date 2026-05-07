DO $$
BEGIN
  -- 1. Remover o status 'nao-responde'
  DELETE FROM public.funil_etapas WHERE slug = 'nao-responde';
  
  -- 2. Atualizar a ordem das etapas existentes e adicionar 'fechamento'
  UPDATE public.funil_etapas SET ordem = 1 WHERE slug = 'novo';
  UPDATE public.funil_etapas SET ordem = 2 WHERE slug = 'agendado';
  UPDATE public.funil_etapas SET ordem = 3 WHERE slug = 'faltou';
  UPDATE public.funil_etapas SET ordem = 4 WHERE slug = 'atendido';
  
  INSERT INTO public.funil_etapas (id, nome, slug, cor, ordem, ativo)
  VALUES (gen_random_uuid(), 'Fechamento', 'fechamento', '#10b981', 5, true)
  ON CONFLICT (slug) DO UPDATE SET ordem = 5, ativo = true, nome = 'Fechamento';
  
  UPDATE public.funil_etapas SET ordem = 6 WHERE slug = 'demitido';
END $$;

-- 3. Adicionar colunas para contagem de histórico de agendamentos e faltas no funil
ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS qtd_agendamentos integer DEFAULT 1;
ALTER TABLE public.funil_leads ADD COLUMN IF NOT EXISTS qtd_faltas integer DEFAULT 0;

ALTER TABLE public.funil_dados_mensais ADD COLUMN IF NOT EXISTS faltas_realizado integer DEFAULT 0;

-- 4. Trigger para incrementar qtd_agendamentos e qtd_faltas corretamente
CREATE OR REPLACE FUNCTION public.trg_incrementa_status_funil()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'faltou' AND NEW.status IN ('agendado', 'reagendado') THEN
      NEW.qtd_agendamentos := COALESCE(OLD.qtd_agendamentos, 1) + 1;
    END IF;
    
    IF OLD.status != 'faltou' AND NEW.status = 'faltou' THEN
      NEW.qtd_faltas := COALESCE(OLD.qtd_faltas, 0) + 1;
    END IF;
  END IF;
  
  IF TG_OP = 'INSERT' THEN
    IF NEW.status = 'faltou' THEN
      NEW.qtd_faltas := COALESCE(NEW.qtd_faltas, 0) + 1;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_incrementa_status_funil_tg ON public.funil_leads;
CREATE TRIGGER trg_incrementa_status_funil_tg
  BEFORE INSERT OR UPDATE ON public.funil_leads
  FOR EACH ROW EXECUTE FUNCTION public.trg_incrementa_status_funil();

-- 5. Atualizar o trigger de funil_dados_mensais_from_leads para as novas regras de negócio
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
  
  -- Agendamentos (Soma da coluna qtd_agendamentos para contabilizar reagendamentos como novos eventos)
  SELECT COALESCE(SUM(COALESCE(qtd_agendamentos, 1)), 0) INTO v_agendamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('agendado', 'reagendado', 'atendido', 'faltou', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento');

  -- Comparecimentos (Todos que chegaram na clínica)
  SELECT COUNT(*) INTO v_comparecimentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('atendido', 'negociacao', 'venda-fechada', 'venda-perdida', 'avaliacao', 'fechamento');

  -- Fechamentos
  SELECT COUNT(*) INTO v_fechamentos FROM public.funil_leads 
  WHERE origem_id = v_origem_id 
  AND mes_referencia = v_mes_referencia 
  AND status IN ('fechamento', 'venda-fechada');
  
  -- Faltas (Soma do histórico de faltas para separar o cálculo)
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

-- 6. Retroagir dados existentes para popular os totalizadores
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.funil_leads LOOP
    UPDATE public.funil_leads SET atualizado_em = NOW() WHERE id = r.id;
  END LOOP;
END $$;
