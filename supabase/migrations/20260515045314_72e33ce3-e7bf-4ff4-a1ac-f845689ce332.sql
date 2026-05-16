-- Restrict profile_settings to admins; expose safe public view
DROP POLICY IF EXISTS "anyone can read profile" ON public.profile_settings;

CREATE POLICY "admins read profile"
ON public.profile_settings
FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

-- Public-safe view: omits email + whatsapp
CREATE OR REPLACE VIEW public.profile_public
WITH (security_invoker = true) AS
SELECT
  id,
  branding_name,
  full_name,
  subtitle,
  about,
  location,
  availability,
  typing_texts,
  profile_image_url,
  cv_url,
  github_url,
  linkedin_url,
  instagram_url,
  tiktok_url,
  updated_at
FROM public.profile_settings;

GRANT SELECT ON public.profile_public TO anon, authenticated;