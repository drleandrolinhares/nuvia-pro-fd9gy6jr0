-- Add relationship and status tracking for individual comissions directly in vendas_confirmadas
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS fatura_comissao_id uuid REFERENCES public.faturas_comissoes(id) ON DELETE SET NULL;
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS status_comissao text DEFAULT 'em_aberto';
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS percentual_comissao numeric;
ALTER TABLE public.vendas_confirmadas ADD COLUMN IF NOT EXISTS valor_comissao numeric;
