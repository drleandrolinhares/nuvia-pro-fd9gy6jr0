DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'precificacao_ocupacao_cadeiras' 
    AND column_name = 'semana'
  ) THEN
    ALTER TABLE public.precificacao_ocupacao_cadeiras ADD COLUMN semana INTEGER NOT NULL DEFAULT 1;
  END IF;
END $$;

ALTER TABLE public.precificacao_ocupacao_cadeiras DROP CONSTRAINT IF EXISTS precificacao_ocupacao_cadeiras_consultorio_turno_dia_semana_key;
ALTER TABLE public.precificacao_ocupacao_cadeiras DROP CONSTRAINT IF EXISTS precificacao_ocupacao_cadeiras_consultorio_turno_dia_semana_semana_key;

ALTER TABLE public.precificacao_ocupacao_cadeiras ADD CONSTRAINT precificacao_ocupacao_cadeiras_consultorio_turno_dia_semana_semana_key UNIQUE (consultorio, turno, dia_semana, semana);
