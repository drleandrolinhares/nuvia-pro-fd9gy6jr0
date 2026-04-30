DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pedidos_materiais_usuario_id_usuarios_fkey'
  ) THEN
    ALTER TABLE public.pedidos_materiais
      ADD CONSTRAINT pedidos_materiais_usuario_id_usuarios_fkey
      FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;
  END IF;
END $$;
