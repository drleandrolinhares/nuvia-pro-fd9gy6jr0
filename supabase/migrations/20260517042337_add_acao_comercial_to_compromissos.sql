DO $DO$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_namespace n ON n.oid = t.typnamespace 
    WHERE t.typname = 'tipo_compromisso_enum' 
    AND n.nspname = 'public' 
    AND 'acao_comercial'::text = ANY(enum_range(NULL::public.tipo_compromisso_enum)::text[])
  ) THEN
    ALTER TYPE public.tipo_compromisso_enum ADD VALUE 'acao_comercial';
  END IF;
END $DO$;

ALTER TABLE public.compromissos 
ADD COLUMN IF NOT EXISTS paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.funil_leads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS status_acao TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS resultado_acao TEXT,
ADD COLUMN IF NOT EXISTS concluido_em TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS concluido_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL;
