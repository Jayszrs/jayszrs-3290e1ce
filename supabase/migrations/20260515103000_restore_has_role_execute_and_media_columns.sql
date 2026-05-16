REVOKE EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(UUID, public.app_role) TO authenticated;

ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS document_url TEXT;
