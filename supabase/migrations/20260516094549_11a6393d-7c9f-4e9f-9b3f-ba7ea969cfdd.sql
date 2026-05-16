
ALTER TABLE public.education
  ADD COLUMN IF NOT EXISTS field_of_study text,
  ADD COLUMN IF NOT EXISTS grade text,
  ADD COLUMN IF NOT EXISTS activities text,
  ADD COLUMN IF NOT EXISTS document_url text;

ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS duration_months integer;

ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS employment_type text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS duration_months integer;

ALTER TABLE public.certifications
  ADD COLUMN IF NOT EXISTS credential_id text;
