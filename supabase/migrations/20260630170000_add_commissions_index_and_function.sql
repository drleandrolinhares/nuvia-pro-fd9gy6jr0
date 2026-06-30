-- Performance index for monthly filtering on vendas_confirmadas
CREATE INDEX IF NOT EXISTS idx_vendas_confirmadas_data_fechamento
  ON public.vendas_confirmadas(data_fechamento);

-- Server-side commission calculation function for performance optimization
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
    COALESCE((
      SELECT rcd.percentual_comissao
      FROM public.referencias_comissao_dentista rcd
      WHERE rcd.status = 'ativo'
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END >= rcd.faixa_entrada_minima
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END <= rcd.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS percentual_comissao_dentista,
    COALESCE((
      SELECT (vc.valor_tratamento * rcd.percentual_comissao / 100)
      FROM public.referencias_comissao_dentista rcd
      WHERE rcd.status = 'ativo'
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END >= rcd.faixa_entrada_minima
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END <= rcd.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS valor_comissao_dentista,
    COALESCE((
      SELECT rcc.percentual_comissao
      FROM public.referencias_comissao_crc rcc
      WHERE rcc.status = 'ativo'
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END >= rcc.faixa_entrada_minima
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END <= rcc.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS percentual_comissao_crc,
    COALESCE((
      SELECT (vc.valor_tratamento * rcc.percentual_comissao / 100)
      FROM public.referencias_comissao_crc rcc
      WHERE rcc.status = 'ativo'
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END >= rcc.faixa_entrada_minima
        AND CASE WHEN vc.valor_tratamento > 0
          THEN (vc.valor_entrada / vc.valor_tratamento) * 100
          ELSE 0
        END <= rcc.faixa_entrada_maxima
      LIMIT 1
    ), 0) AS valor_comissao_crc,
    vc.status_comissao
  FROM public.vendas_confirmadas vc
  LEFT JOIN public.dentistas_avaliadores da ON da.id = vc.dentista_avaliador
  LEFT JOIN public.crc_comercial cc ON cc.id = vc.crc
  WHERE vc.data_fechamento >= p_data_inicio
    AND vc.data_fechamento <= p_data_fim
  ORDER BY vc.data_fechamento DESC;
$$;
