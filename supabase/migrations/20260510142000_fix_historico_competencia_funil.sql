-- Restaura o mes_referencia dos leads para a data da avaliação original,
-- corrigindo dados históricos que foram alterados indevidamente pela versão anterior da trigger.

DO $$
BEGIN
  UPDATE public.funil_leads fl
  SET mes_referencia = to_char(a.data_avaliacao, 'YYYY-MM')
  FROM public.vendas_confirmadas vc
  JOIN public.avaliacoes a ON a.id = vc.oportunidade_id
  WHERE fl.nome ILIKE vc.paciente_nome
    AND fl.mes_referencia != to_char(a.data_avaliacao, 'YYYY-MM');
END $$;
