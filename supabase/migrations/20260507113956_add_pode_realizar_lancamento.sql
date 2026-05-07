ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS pode_realizar_lancamento boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  -- Dar permissao aos usuarios nao-administradores/nao-gestores por padrao
  -- para manter o comportamento anterior onde !isManager permitia lançamentos
  UPDATE public.usuarios 
  SET pode_realizar_lancamento = true 
  WHERE role IS NULL OR role NOT IN ('admin', 'gestor');

  -- Tambem dar permissao especificamente para Heloisa se ja existir, 
  -- baseado no pedido anterior, para garantir que ela nao perca acesso
  UPDATE public.usuarios 
  SET pode_realizar_lancamento = true 
  WHERE nome ILIKE '%heloisa%';
END $$;
