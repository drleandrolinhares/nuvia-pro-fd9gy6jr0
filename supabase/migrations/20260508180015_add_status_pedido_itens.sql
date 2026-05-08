DO $$
BEGIN
  ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS status text DEFAULT 'pendente';
END $$;

UPDATE public.pedido_itens
SET status = 'entregue'
FROM public.pedidos_materiais
WHERE public.pedido_itens.pedido_id = public.pedidos_materiais.id 
  AND public.pedidos_materiais.status = 'entregue' 
  AND public.pedido_itens.status = 'pendente';
