-- Update calcular_comissao_periodo to use aggregate (per-professional) entry percentage
-- instead of per-sale entry percentage for commission rate lookup

CREATE OR REPLACE FUNCTION public.calcular_comissao_periodo(
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  id UUID,
  paciente_nome TEXT,
  data_fechamento DATE,
  valor_tratamento NUMERIC,
  valor_entrada NUMERIC,
  percentual_entrada NUMERIC,
  dentista_avaliador UUID,
  dentista_nome TEXT,
  crc UUID,
  crc_nome TEXT,
  percentual_comissao_dentista NUMERIC,
  valor_comissao_dentista NUMERIC,
  percentual_comissao_crc NUMERIC,
  valor_comissao_crc NUMERIC,
  status_comissao TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
WITH dentista_agg AS (
  SELECT
    vc.dentista_avaliador,
    SUM(vc.valor_tratamento) AS total_sales,
    SUM(vc.valor_entrada) AS total_entries,
    CASE WHEN SUM(vc.valor_tratamento) > 0
      THEN ROUND((SUM(vc.valor_entrada) / SUM(vc.valor_tratamento)) * 100, 2)
      ELSE 0
    END AS entry_pct
  FROM public.vendas_confirmadas vc
  WHERE vc.data_fechamento >= p_data_inicio
    AND vc.data_fechamento <= p_data_fim
    AND vc.dentista_avaliador IS NOT NULL
  GROUP BY vc.dentista_avaliador
),
crc_agg AS (
  SELECT
    vc.crc,
    SUM(vc.valor_tratamento) AS total_sales,
    SUM(vc.valor_entrada) AS total_entries,
    CASE WHEN SUM(vc.valor_tratamento) > 0
      THEN ROUND((SUM(vc.valor_entrada) / SUM(vc.valor_tratamento)) * 100, 2)
      ELSE 0
    END AS entry_pct
  FROM public.vendas_confirmadas vc
  WHERE vc.data_fechamento >= p_data_inicio
    AND vc.data_fechamento <= p_data_fim
    AND vc.crc IS NOT NULL
  GROUP BY vc.crc
),
dentista_rate AS (
  SELECT
    da.dentista_avaliador,
    COALESCE((
      SELECT rcd.percentual_comissao
      FROM public.referencias_comissao_dentista rcd
      WHERE rcd.status = 'ativo'
        AND da.entry_pct >= rcd.faixa_entrada_minima
        AND da.entry_pct <= rcd.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS rate
  FROM dentista_agg da
),
crc_rate AS (
  SELECT
    ca.crc,
    COALESCE((
      SELECT rcc.percentual_comissao
      FROM public.referencias_comissao_crc rcc
      WHERE rcc.status = 'ativo'
        AND ca.entry_pct >= rcc.faixa_entrada_minima
        AND ca.entry_pct <= rcc.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS rate
  FROM crc_agg ca
)
SELECT
  vc.id,
  vc.paciente_nome,
  vc.data_fechamento,
  vc.valor_tratamento,
  vc.valor_entrada,
  CASE WHEN vc.valor_tratamento > 0
    THEN ROUND((vc.valor_entrada / vc.valor_tratamento) * 100, 2)
    ELSE 0
  END AS percentual_entrada,
  vc.dentista_avaliador,
  da.nome AS dentista_nome,
  vc.crc,
  cc.nome AS crc_nome,
  COALESCE(dr.rate, 0) AS percentual_comissao_dentista,
  (vc.valor_tratamento * COALESCE(dr.rate, 0) / 100) AS valor_comissao_dentista,
  COALESCE(cr.rate, 0) AS percentual_comissao_crc,
  (vc.valor_tratamento * COALESCE(cr.rate, 0) / 100) AS valor_comissao_crc,
  vc.status_comissao
FROM public.vendas_confirmadas vc
LEFT JOIN public.dentistas_avaliadores da ON da.id = vc.dentista_avaliador
LEFT JOIN public.crc_comercial cc ON cc.id = vc.crc
LEFT JOIN dentista_rate dr ON dr.dentista_avaliador = vc.dentista_avaliador
LEFT JOIN crc_rate cr ON cr.crc = vc.crc
WHERE vc.data_fechamento >= p_data_inicio
  AND vc.data_fechamento <= p_data_fim
ORDER BY vc.data_fechamento DESC;
$$;
