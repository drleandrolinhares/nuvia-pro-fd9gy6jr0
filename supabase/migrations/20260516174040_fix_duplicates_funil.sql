DO $$
DECLARE
    r RECORD;
    v_keep_id uuid;
BEGIN
    -- Deduplicate funil_leads
    FOR r IN 
        SELECT lower(trim(nome)) as n, mes_referencia, origem_id, count(*) as c
        FROM public.funil_leads
        GROUP BY lower(trim(nome)), mes_referencia, origem_id
        HAVING count(*) > 1
    LOOP
        -- find the one to keep
        SELECT id INTO v_keep_id
        FROM public.funil_leads
        WHERE lower(trim(nome)) = r.n AND mes_referencia = r.mes_referencia AND origem_id = r.origem_id
        ORDER BY 
            CASE WHEN status IN ('venda_concretizada', 'venda-fechada', 'fechamento') THEN 1 ELSE 2 END,
            CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 2 END,
            criado_em DESC
        LIMIT 1;

        -- update references
        UPDATE public.funil_leads_historico SET lead_id = v_keep_id
        WHERE lead_id IN (
            SELECT id FROM public.funil_leads 
            WHERE lower(trim(nome)) = r.n AND mes_referencia = r.mes_referencia AND origem_id = r.origem_id AND id != v_keep_id
        );

        UPDATE public.funil_leads_notas SET lead_id = v_keep_id
        WHERE lead_id IN (
            SELECT id FROM public.funil_leads 
            WHERE lower(trim(nome)) = r.n AND mes_referencia = r.mes_referencia AND origem_id = r.origem_id AND id != v_keep_id
        );

        -- delete the duplicates
        DELETE FROM public.funil_leads
        WHERE lower(trim(nome)) = r.n AND mes_referencia = r.mes_referencia AND origem_id = r.origem_id AND id != v_keep_id;
    END LOOP;
END $$;

-- Create unique index
DROP INDEX IF EXISTS funil_leads_nome_mes_origem_idx;
CREATE UNIQUE INDEX funil_leads_nome_mes_origem_idx 
ON public.funil_leads (lower(trim(nome)), mes_referencia, origem_id);

-- Update the trigger
CREATE OR REPLACE FUNCTION public.trg_vendas_confirmadas_to_funil()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_mes_referencia text;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.origem_id IS NOT NULL THEN
      IF NEW.oportunidade_id IS NOT NULL THEN
        SELECT to_char(data_avaliacao::date, 'YYYY-MM') INTO v_mes_referencia 
        FROM public.avaliacoes 
        WHERE id = NEW.oportunidade_id;
      END IF;

      IF v_mes_referencia IS NULL THEN
        v_mes_referencia := to_char(NEW.data_fechamento::date, 'YYYY-MM');
      END IF;
      
      IF TG_OP = 'INSERT' THEN
        INSERT INTO public.funil_leads (
          nome, telefone, origem_id, mes_referencia, status, temperatura, qtd_agendamentos, qtd_faltas
        ) VALUES (
          trim(NEW.paciente_nome), NEW.telefone, NEW.origem_id, v_mes_referencia, 'venda_concretizada', 'quente', 1, 0
        )
        ON CONFLICT (lower(trim(nome)), mes_referencia, origem_id) DO UPDATE SET
          status = 'venda_concretizada',
          temperatura = 'quente',
          telefone = COALESCE(public.funil_leads.telefone, EXCLUDED.telefone),
          atualizado_em = NOW();
      END IF;

    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Update avaliacao trigger
CREATE OR REPLACE FUNCTION public.trg_garantir_avaliacao_para_venda()
 RETURNS trigger
 LANGUAGE plpgsql
AS $$
DECLARE
  v_paciente_id uuid;
  v_oportunidade_id uuid;
BEGIN
  IF NEW.oportunidade_id IS NULL THEN
    -- Try to find patient by name
    SELECT id INTO v_paciente_id FROM public.pacientes WHERE lower(trim(nome)) = lower(trim(NEW.paciente_nome)) LIMIT 1;
    
    -- If not found, create one
    IF v_paciente_id IS NULL THEN
      v_paciente_id := gen_random_uuid();
      INSERT INTO public.pacientes (id, nome, telefone) VALUES (v_paciente_id, trim(NEW.paciente_nome), NEW.telefone);
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
  
  NEW.paciente_nome := trim(NEW.paciente_nome);
  
  RETURN NEW;
END;
$$;

-- Recalculate funil_dados_mensais
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT DISTINCT origem_id, mes_referencia FROM public.funil_leads LOOP
        PERFORM public.atualizar_funil_dados_mensais(r.origem_id, r.mes_referencia);
    END LOOP;
END $$;
