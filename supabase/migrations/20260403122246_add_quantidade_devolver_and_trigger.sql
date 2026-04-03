-- Adiciona a coluna quantidade_devolver na tabela saida_produtos
ALTER TABLE public.saida_produtos ADD COLUMN IF NOT EXISTS quantidade_devolver integer;

DO $$
BEGIN
  -- Remove a trigger se ela já existir para garantir a idempotência
  DROP TRIGGER IF EXISTS after_saida_produto ON public.saida_produtos;
END $$;

-- Cria ou substitui a função que atualiza o estoque após a saída
CREATE OR REPLACE FUNCTION public.trg_atualiza_estoque_saida()
RETURNS trigger AS $$
BEGIN
  -- Quando uma nova saída é registrada, reduz a quantidade no estoque do produto
  UPDATE public.produtos
  SET quantidade_estoque = COALESCE(quantidade_estoque, 0) - NEW.quantidade
  WHERE id = NEW.produto_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cria a trigger para disparar após cada inserção na tabela de saida_produtos
CREATE TRIGGER after_saida_produto
AFTER INSERT ON public.saida_produtos
FOR EACH ROW EXECUTE FUNCTION public.trg_atualiza_estoque_saida();
