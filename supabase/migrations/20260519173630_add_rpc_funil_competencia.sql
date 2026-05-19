CREATE OR REPLACE FUNCTION public.get_funil_competencia_metrics(p_mes_referencia text)
RETURNS TABLE (
    origem_id uuid,
    origem_nome text,
    qtd_oportunidades bigint,
    valor_oportunidades numeric,
    qtd_vendas bigint,
    valor_vendas numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH oportunidades AS (
        SELECT 
            a.origem_id,
            COUNT(a.id) as qtd_oportunidades,
            COALESCE(SUM(a.valor_orcamento), 0) as valor_oportunidades
        FROM public.avaliacoes a
        WHERE to_char(COALESCE(a.data_avaliacao, a.criado_em::date), 'YYYY-MM') = p_mes_referencia
        GROUP BY a.origem_id
    ),
    vendas AS (
        SELECT 
            v.origem_id,
            COUNT(v.id) as qtd_vendas,
            COALESCE(SUM(v.valor_tratamento), 0) as valor_vendas
        FROM public.vendas_confirmadas v
        LEFT JOIN public.avaliacoes a ON a.id = v.oportunidade_id
        WHERE to_char(v.data_fechamento::date, 'YYYY-MM') = p_mes_referencia
          AND to_char(COALESCE(v.data_original, a.data_avaliacao, v.data_fechamento::date), 'YYYY-MM') = p_mes_referencia
        GROUP BY v.origem_id
    )
    SELECT 
        o.id as origem_id,
        o.nome as origem_nome,
        COALESCE(op.qtd_oportunidades, 0) as qtd_oportunidades,
        COALESCE(op.valor_oportunidades, 0) as valor_oportunidades,
        COALESCE(vd.qtd_vendas, 0) as qtd_vendas,
        COALESCE(vd.valor_vendas, 0) as valor_vendas
    FROM public.funil_origens o
    LEFT JOIN oportunidades op ON op.origem_id = o.id
    LEFT JOIN vendas vd ON vd.origem_id = o.id
    ORDER BY o.ordem;
END;
$$;
