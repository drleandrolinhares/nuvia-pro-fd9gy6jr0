-- Remove backend function related to the Competence Funnel block to ensure no lingering logic
DROP FUNCTION IF EXISTS public.get_funil_competencia_metrics(text);
