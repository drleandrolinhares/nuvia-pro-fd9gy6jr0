-- Ensure RLS policies allow authenticated users to read commission-related tables

-- vendas_confirmadas
ALTER TABLE public.vendas_confirmadas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vendas_confirmadas_select" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_select" ON public.vendas_confirmadas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "vendas_confirmadas_insert" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_insert" ON public.vendas_confirmadas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "vendas_confirmadas_update" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_update" ON public.vendas_confirmadas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "vendas_confirmadas_delete" ON public.vendas_confirmadas;
CREATE POLICY "vendas_confirmadas_delete" ON public.vendas_confirmadas
  FOR DELETE TO authenticated USING (true);

-- referencias_comissao_dentista
ALTER TABLE public.referencias_comissao_dentista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ref_comissao_dentista_select" ON public.referencias_comissao_dentista;
CREATE POLICY "ref_comissao_dentista_select" ON public.referencias_comissao_dentista
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ref_comissao_dentista_insert" ON public.referencias_comissao_dentista;
CREATE POLICY "ref_comissao_dentista_insert" ON public.referencias_comissao_dentista
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ref_comissao_dentista_update" ON public.referencias_comissao_dentista;
CREATE POLICY "ref_comissao_dentista_update" ON public.referencias_comissao_dentista
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ref_comissao_dentista_delete" ON public.referencias_comissao_dentista;
CREATE POLICY "ref_comissao_dentista_delete" ON public.referencias_comissao_dentista
  FOR DELETE TO authenticated USING (true);

-- referencias_comissao_crc
ALTER TABLE public.referencias_comissao_crc ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ref_comissao_crc_select" ON public.referencias_comissao_crc;
CREATE POLICY "ref_comissao_crc_select" ON public.referencias_comissao_crc
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "ref_comissao_crc_insert" ON public.referencias_comissao_crc;
CREATE POLICY "ref_comissao_crc_insert" ON public.referencias_comissao_crc
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "ref_comissao_crc_update" ON public.referencias_comissao_crc;
CREATE POLICY "ref_comissao_crc_update" ON public.referencias_comissao_crc
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "ref_comissao_crc_delete" ON public.referencias_comissao_crc;
CREATE POLICY "ref_comissao_crc_delete" ON public.referencias_comissao_crc
  FOR DELETE TO authenticated USING (true);

-- Grant execute on the calcular_comissao_periodo function to authenticated
GRANT EXECUTE ON FUNCTION public.calcular_comissao_periodo(DATE, DATE) TO authenticated;
