CREATE TABLE IF NOT EXISTS public.pedidos_materiais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'rascunho', 
  ciclo_entrega DATE NOT NULL,
  data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
  data_envio TIMESTAMPTZ,
  data_entrega TIMESTAMPTZ,
  entregue_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  valor_total NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  CONSTRAINT valid_status CHECK (status IN ('rascunho', 'enviado', 'entregue', 'cancelado'))
);

CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pedido_id UUID NOT NULL REFERENCES public.pedidos_materiais(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE RESTRICT,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario NUMERIC NOT NULL DEFAULT 0,
  valor_total NUMERIC NOT NULL DEFAULT 0
);

DO $$
BEGIN
  INSERT INTO public.permissoes (nome, modulo, descricao)
  VALUES 
    ('operacional_pedidos', 'Operacional', 'Acessar e criar pedidos de materiais'),
    ('operacional_pedidos_gerenciar', 'Operacional', 'Gerenciar e entregar pedidos de materiais')
  ON CONFLICT (nome) DO NOTHING;
END $$;

ALTER TABLE public.pedidos_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pedidos_materiais_all" ON public.pedidos_materiais;
CREATE POLICY "pedidos_materiais_all" ON public.pedidos_materiais
  FOR ALL TO authenticated
  USING (usuario_id = auth.uid() OR public.has_permission('operacional_pedidos_gerenciar') OR public.is_admin())
  WITH CHECK (usuario_id = auth.uid() OR public.has_permission('operacional_pedidos_gerenciar') OR public.is_admin());

DROP POLICY IF EXISTS "pedido_itens_all" ON public.pedido_itens;
CREATE POLICY "pedido_itens_all" ON public.pedido_itens
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pedidos_materiais p WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR public.has_permission('operacional_pedidos_gerenciar') OR public.is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pedidos_materiais p WHERE p.id = pedido_id AND (p.usuario_id = auth.uid() OR public.has_permission('operacional_pedidos_gerenciar') OR public.is_admin())));
