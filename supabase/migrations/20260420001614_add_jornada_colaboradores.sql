ALTER TABLE public.usuarios
  ADD COLUMN IF NOT EXISTS ordem integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS horario_entrada time,
  ADD COLUMN IF NOT EXISTS inicio_lanche_manha time,
  ADD COLUMN IF NOT EXISTS fim_lanche_manha time,
  ADD COLUMN IF NOT EXISTS saida_almoco time,
  ADD COLUMN IF NOT EXISTS retorno_almoco time,
  ADD COLUMN IF NOT EXISTS inicio_lanche_tarde time,
  ADD COLUMN IF NOT EXISTS fim_lanche_tarde time,
  ADD COLUMN IF NOT EXISTS horario_saida time;
