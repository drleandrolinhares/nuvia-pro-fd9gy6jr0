-- Add Sunday access time columns to configuracoes_acesso
-- Allows configuring Sunday access hours (defaults to 00:00 = closed)

ALTER TABLE public.configuracoes_acesso
  ADD COLUMN IF NOT EXISTS dom_inicio text DEFAULT '00:00';

ALTER TABLE public.configuracoes_acesso
  ADD COLUMN IF NOT EXISTS dom_fim text DEFAULT '00:00';
