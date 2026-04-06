DO $$
BEGIN
  -- Drop dependent tables first
  DROP TABLE IF EXISTS public.comissoes_crc CASCADE;
  DROP TABLE IF EXISTS public.comissoes_dentista CASCADE;
  DROP TABLE IF EXISTS public.vendas_concretizadas CASCADE;
  
  -- Update avaliacoes status to remove reference to venda_concretizada
  UPDATE public.avaliacoes 
  SET status = 'avaliacao_realizada' 
  WHERE status = 'venda_concretizada';
END $$;
