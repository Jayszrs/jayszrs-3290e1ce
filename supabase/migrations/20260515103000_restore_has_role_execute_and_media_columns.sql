GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated;

ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS document_url TEXT;
